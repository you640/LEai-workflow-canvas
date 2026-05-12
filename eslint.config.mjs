import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "**/components/workflow/workflow-canvas.tsx",
      "**/components/workflow/workflow-editor.tsx",
      "**/components/workflow/workflow-toolbar.tsx",
      "**/components/workflow/add-node-dialog.tsx",
      "**/components/workflow/base-node.tsx",
      "**/components/workflow/load-workflow-dialog.tsx",
      "**/components/workflow/node-edit-panel.tsx",
      "**/components/workflow/node-palette.tsx",
      "**/components/workflow/output-panel.tsx",
      "**/components/workflow/run-history-dialog.tsx",
      "**/components/workflow/templates-dialog.tsx",
      "**/components/workflow/nodes/**",
      "**/components/ui/**",
      "**/hooks/use-mobile.tsx",
    ],
  },
  ...nextVitals,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
    },
  },
];

export default config;
