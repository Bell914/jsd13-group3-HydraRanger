# OCCASION UI components

Import shared UI from the public component entry point:

```jsx
import { Button, FormInput, Alert } from "../components/index.js";
```

## Usage rules

- Use `primary` for the main action on a section and `secondary`, `outline`, or `ghost` for supporting actions.
- Use `accent` for a deliberately highlighted action. Use `danger` only for destructive or irreversible actions.
- Every form control needs a visible `label`. Pass `error` for validation feedback and `helpText` for supporting guidance.
- Do not use placeholder text as the only label.
- Use `Badge` text that explains the status; color alone must not carry meaning.
- `Alert` uses `role="alert"` only for errors. Other messages use a polite status announcement.
- `Modal` requires `open`, `onClose`, and `title`. It handles Escape, backdrop close, focus containment, scroll locking, and focus restoration.
- Prefer the shared components before adding page-specific copies. Page behavior and data fetching stay outside this folder.

## Reference page

Run the client and open `/ui-kit` to review every component and its important states at 375px, 768px, and 1280px.
