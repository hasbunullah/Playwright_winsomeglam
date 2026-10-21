import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Winsome Glam Automation',
  output: './allure-report',
  historyPath: './.allure/history.jsonl',
  historyLimit: 20,
  plugins: {
    awesome: {
      options: { reportName: 'Winsome Glam Automation' },
    },
  },
});
