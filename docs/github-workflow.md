# GitHub Workflow

## Sprints

- We work in **2-week sprints**
- **@seberatolmez** and **@dogukanurker** assign tasks
- Each task has priority and effort labels
- Check the GitHub Project board for your assigned tasks

---

## Create an Issue (Ticket)

1. Go to **Issues** tab in GitHub
2. Click **New issue**
3. Fill in:
   - **Title**: Short description (e.g., "Add login page")
   - **Description**: Details, acceptance criteria
   - **Labels**: `bug`, `feature`, `docs`, etc.
   - **Assignees**: Who will work on it
   - **Sprint**: Select current sprint from Projects
4. Click **Submit new issue**

## Create a Pull Request (PR)

After pushing your branch:

1. Go to **Pull requests** tab
2. Click **New pull request**
3. Select your branch to merge into `main`
4. Fill in:
   - **Title**: What this PR does
   - **Description**: 
     - What changed
     - Link to issue: `Closes #123`
   - **Reviewers**: Add at least 1 reviewer (admin)
   - **Assignees**: Yourself
5. Click **Create pull request**

## Add Reviewers

1. On the PR page, find **Reviewers** on the right sidebar
2. Click the gear icon
3. Add both reviewers:
   - `seberatolmez`
   - `dogukanurker`
4. They will be notified

**Both reviewers must approve your PR before it can be merged.**

## PR Review Process

### As a reviewer:

1. Go to **Files changed** tab
2. Review the code
3. Add comments if needed (click the `+` on any line)
4. Submit review:
   - **Approve**: Code is good
   - **Request changes**: Needs fixes
   - **Comment**: Just feedback

### As a PR author:

1. Address review comments
2. Push fixes to the same branch
3. Request re-review if needed

## Merge Rules

- PRs must be reviewed by **both**:
  - `@seberatolmez`
  - `@dogukanurker`
- **Both must approve** before merging
- All checks (linting) must pass
- Only admins can merge to `main`
- **Always use "Squash and merge"** (not regular merge)

### How to Squash and Merge

1. Click the dropdown arrow on the green merge button
2. Select **"Squash and merge"**
3. Edit the commit message if needed
4. Click confirm

This combines all your commits into one clean commit.

## Link PR to Issue

In PR description, use:
- `Closes #123` - closes issue when PR merges
- `Fixes #123` - same as closes
- `Relates to #123` - links without closing

