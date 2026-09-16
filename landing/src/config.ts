/**
 * WealthFlow Landing Page Central Configuration
 * 
 * Centralized configuration for all external links, APK download endpoints,
 * creator attribution, and project metadata.
 */

export interface AppConfig {
  appName: string;
  tagline: string;
  headline: string;
  description: string;
  version: string;
  appPackage: string;
  apkDownloadUrl: string;
  apkFileSize: string;
  portfolioUrl: string;
  githubUrl: string;
  creatorName: string;
  creatorRole: string;
}

export const WEALTHFLOW_CONFIG: AppConfig = {
  appName: 'WealthFlow',
  tagline: 'Personal Finance Made Clearer',
  headline: 'Take control of your money.',
  description:
    'WealthFlow is a personal finance mobile application designed to help you track your money, manage budgets, build savings, and understand your financial habits.',
  version: '1.0.0',
  appPackage: 'app.wealthflow.mobile',
  // Verified EAS Android preview build artifact
  apkDownloadUrl:
    'https://expo.dev/artifacts/eas/_Rp-XG6-OjsS3Jp9xEGlo4Xy6W-lRFZx9-bykm-5faQ.apk',
  apkFileSize: '~65 MB',
  portfolioUrl: 'https://www.youssefmanssouri.site',
  githubUrl: 'https://github.com/manssouriyoussef',
  creatorName: 'Youssef Manssouri',
  creatorRole: 'Full-Stack & Mobile Developer',
};
