## Summary

Brief description of what this PR does and why.

## Related Issues

Closes #

## Changes

-
-
-

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactor (no functional changes)

## Testing

- [ ] Server tests pass (`cd server && npx jest`)
- [ ] Client builds without errors (`cd client && npx vite build`)
- [ ] Manually tested in-game (describe below)

### Manual Test Results

Describe what you tested in-game:

```
> command used
output observed
```

## Screenshots

If this changes the UI, include before/after screenshots.

## Checklist

- [ ] Code follows the project style (TypeScript strict, no `any`, named exports)
- [ ] Engine logic is pure (no DB or HTTP calls in `engine/`)
- [ ] API routes are thin (logic belongs in engine)
- [ ] New features have tests
- [ ] Commit messages follow conventional format (`feat:`, `fix:`, `docs:`, etc.)
