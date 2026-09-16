import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction, Budget, SavingsGoal, SavingsContribution } from '../types/financial';
import { getLocalDateString } from './date';

export interface ExportProfile {
  name?: string;
  email?: string;
  currency?: string;
}

export type ExportSavingsGoal = SavingsGoal & {
  contributions?: SavingsContribution[];
};

export interface ExportPayload {
  version: '1.0';
  app: 'WealthFlow';
  exportedAt: string;
  profile: {
    name: string;
    email: string;
    currency: string;
  };
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: ExportSavingsGoal[];
}

export type ExportResult =
  | { success: true; fileUri: string; dismissed?: boolean }
  | { success: false; error: string; dismissed?: boolean };

/**
 * Checks if a sharing error was caused by the user dismissing or canceling the native share sheet.
 */
export const isShareDismissalError = (err: any): boolean => {
  if (!err) return false;
  const msg = (typeof err === 'string' ? err : err?.message || err?.toString() || '').toLowerCase();
  return (
    msg.includes('dismiss') ||
    msg.includes('cancel') ||
    msg.includes('user did not share') ||
    msg.includes('aborted')
  );
};

/**
 * Constructs a clean, sanitized financial export payload.
 * Strictly omits authentication tokens, passwords, sessions, or internal database metadata.
 */
export const createExportPayload = (
  profile: ExportProfile,
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: ExportSavingsGoal[]
): ExportPayload => {
  return {
    version: '1.0',
    app: 'WealthFlow',
    exportedAt: new Date().toISOString(),
    profile: {
      name: profile.name || 'WealthFlow User',
      email: profile.email || '',
      currency: profile.currency || 'USD',
    },
    transactions: Array.isArray(transactions) ? transactions : [],
    budgets: Array.isArray(budgets) ? budgets : [],
    savingsGoals: Array.isArray(savingsGoals) ? savingsGoals : [],
  };
};

/**
 * Serializes sanitized financial data, writes it to a temporary JSON file,
 * and presents the native Android/iOS share sheet.
 */
export const exportFinancialData = async (
  profile: ExportProfile,
  transactions: Transaction[],
  budgets: Budget[],
  savingsGoals: ExportSavingsGoal[]
): Promise<ExportResult> => {
  try {
    // 1. Sanitize & construct payload
    const payload = createExportPayload(profile, transactions, budgets, savingsGoals);

    // 2. Serialize to readable formatted JSON
    let jsonContent: string;
    try {
      jsonContent = JSON.stringify(payload, null, 2);
    } catch {
      return {
        success: false,
        error: 'Failed to format financial data for export. Please check your data and try again.',
      };
    }

    // 3. Determine directory & file path
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      return {
        success: false,
        error: 'Device temporary storage is unavailable. Please try again later.',
      };
    }

    const dateStr = getLocalDateString();
    const fileName = `wealthflow-export-${dateStr}.json`;
    const fileUri = `${cacheDir}${fileName}`;

    // 4. Write file to device cache
    try {
      await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch {
      return {
        success: false,
        error: 'Failed to save export file to device storage. Please check storage space and permissions.',
      };
    }

    // 5. Verify file exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return {
        success: false,
        error: 'Export file could not be verified on device storage.',
      };
    }

    // 6. Check native sharing availability
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      return {
        success: false,
        error: 'File sharing is not supported or available on this device.',
      };
    }

    // 7. Invoke native share sheet
    try {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Financial Data',
        UTI: 'public.json',
      });
    } catch (shareErr: any) {
      if (isShareDismissalError(shareErr)) {
        return {
          success: true,
          fileUri,
          dismissed: true,
        };
      }
      return {
        success: false,
        error: shareErr?.message || 'File sharing failed. Please try again.',
      };
    }

    return {
      success: true,
      fileUri,
      dismissed: false,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred during export. Please try again.',
    };
  }
};
