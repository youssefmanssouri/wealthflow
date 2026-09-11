import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Transaction, Budget, SavingsGoal, SavingsContribution } from '../types/financial';
import { resolveCanonicalCategoryId } from '../constants/categories';

const MIGRATION_DECISION_KEY = '@wealthflow_migration_decision';

const TX_KEYS = ['@wealthflow_transactions_data', '@wealthflow_transactions'];
const BUDGET_KEYS = ['@wealthflow_budgets_data', '@wealthflow_budgets'];
const SAVINGS_KEYS = ['@wealthflow_savings_data', '@wealthflow_savings_goals'];
const CONTRIB_KEYS = ['@wealthflow_savings_contributions'];

async function getStoredArray<T>(keys: string[]): Promise<T[]> {
  for (const k of keys) {
    const raw = await AsyncStorage.getItem(k);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // ignore parse error and check next key
      }
    }
  }
  return [];
}

export const migrationService = {
  /**
   * Checks whether the user has un-migrated Phase 1 local AsyncStorage data.
   */
  async checkHasLocalData(userId: string): Promise<boolean> {
    try {
      const decision = await AsyncStorage.getItem(`${MIGRATION_DECISION_KEY}_${userId}`);
      if (decision) return false; // Already made decision (imported or fresh)

      const [txs, budgets, goals, contribs] = await Promise.all([
        getStoredArray<Transaction>(TX_KEYS),
        getStoredArray<Budget>(BUDGET_KEYS),
        getStoredArray<SavingsGoal>(SAVINGS_KEYS),
        getStoredArray<SavingsContribution>(CONTRIB_KEYS),
      ]);

      return txs.length > 0 || budgets.length > 0 || goals.length > 0 || contribs.length > 0;
    } catch {
      return false;
    }
  },

  /**
   * Performs idempotent batch import of local Phase 1 data into Supabase.
   * Maps legacy category IDs to canonical UUIDs and assigns `migration_id` to prevent duplicates.
   */
  async migrateLocalDataToCloud(userId: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      let importedCount = 0;

      // 1. Migrate Transactions (resolving legacy category IDs to canonical UUIDs)
      const transactions = await getStoredArray<Transaction>(TX_KEYS);
      for (const tx of transactions) {
        const migrationId = `mig_tx_${tx.id}`;
        const canonicalCategoryId = resolveCanonicalCategoryId(tx.categoryId);
        const { error } = await supabase.from('transactions').upsert(
          {
            user_id: userId,
            category_id: canonicalCategoryId,
            type: tx.type,
            amount: tx.amount,
            merchant: tx.merchant,
            description: tx.description || '',
            transaction_date: tx.date,
            migration_id: migrationId,
          },
          { onConflict: 'migration_id' }
        );

        if (!error) importedCount++;
      }

      // 2. Migrate Budgets (resolving legacy category IDs to canonical UUIDs)
      const budgets = await getStoredArray<Budget>(BUDGET_KEYS);
      for (const b of budgets) {
        const migrationId = `mig_budget_${b.id}`;
        const canonicalCategoryId = resolveCanonicalCategoryId(b.categoryId);
        await supabase.from('budgets').upsert(
          {
            user_id: userId,
            category_id: canonicalCategoryId,
            amount: b.limit || b.amount || 0,
            period: b.period || 'monthly',
            migration_id: migrationId,
          },
          { onConflict: 'migration_id' }
        );
      }

      // 3. Migrate Savings Goals & Map Goal IDs for Contributions
      const goalIdMap: Record<string, string> = {}; // localGoalId -> cloudGoalId
      const goals = await getStoredArray<SavingsGoal>(SAVINGS_KEYS);
      for (const g of goals) {
        const migrationId = `mig_goal_${g.id}`;
        const { data, error } = await supabase
          .from('savings_goals')
          .upsert(
            {
              user_id: userId,
              name: g.name,
              target_amount: g.targetAmount,
              current_amount: g.currentAmount,
              target_date: g.targetDate,
              migration_id: migrationId,
            },
            { onConflict: 'migration_id' }
          )
          .select('id')
          .single();

        if (!error && data) {
          goalIdMap[g.id] = data.id;
        }
      }

      // 4. Migrate Savings Contributions (Referential Integrity + Idempotency)
      const contribs = await getStoredArray<SavingsContribution>(CONTRIB_KEYS);
      for (const c of contribs) {
        const targetCloudGoalId = goalIdMap[c.goalId];
        if (targetCloudGoalId) {
          const migrationId = `mig_contrib_${c.id}`;
          await supabase.from('savings_contributions').upsert(
            {
              user_id: userId,
              goal_id: targetCloudGoalId,
              amount: c.amount,
              contribution_date: c.date || new Date().toISOString(),
              note: c.note || null,
              migration_id: migrationId,
            },
            { onConflict: 'migration_id' }
          );
        }
      }

      // Save migration decision as completed
      await AsyncStorage.setItem(`${MIGRATION_DECISION_KEY}_${userId}`, 'imported');
      return { success: true, count: importedCount };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message || 'Migration failed' };
    }
  },

  /**
   * User chose to Start Fresh with a clean account without uploading local data.
   */
  async setStartFreshDecision(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(`${MIGRATION_DECISION_KEY}_${userId}`, 'start_fresh');
    } catch (err) {
      console.warn('Error saving decision:', err);
    }
  },
};
