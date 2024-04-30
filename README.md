![Nightly build](https://github.com/dhis2/line-listing-app/actions/workflows/nightly.yml/badge.svg)
![Release build](https://github.com/dhis2/line-listing-app/actions/workflows/dhis2-verify-app.yml/badge.svg?branch=master)

## Available Scripts

After cloning the repo, run:

`yarn install`<br />
`yarn d2-style install`

<br />

For development you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner and runs all available tests found in `/src`.<br />

See the section about [running tests](https://platform.dhis2.nu/#/scripts/test) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
A deployable `.zip` file can be found in `build/bundle`!

See the section about [building](https://platform.dhis2.nu/#/scripts/build) for more information.

### `yarn deploy`

Deploys the built app in the `build` folder to a running DHIS2 instance.<br />
This command will prompt you to enter a server URL as well as the username and password of a DHIS2 user with the App Management authority.<br/>
You must run `yarn build` before running `yarn deploy`.<br />

See the section about [deploying](https://platform.dhis2.nu/#/scripts/deploy) for more information.

### Cypress tests

In order to run the cypress tests locally make sure you have configured your gitignore'd `cypress.env.json` at the root of the repo like so:

```
{
    "dhis2BaseUrl": "https://test.e2e.dhis2.org/analytics-dev/",
    "dhis2Username": ...,
    "dhis2Password": ...
    "dhis2InstanceVersion": "dev"
}
```

Make sure that the `dhis2InstanceVersion` matches the version that is running at the dhis2BaseUrl. You can use 'dev' if the instance is dev, or else get the running instance version from this endpoint: `/api/system/info?fields=version` (which might return something like this: `2.40-SNAPSHOT`)

Here is an example configuration for running tests against 2.38:

```
{
    "dhis2BaseUrl": "https://test.e2e.dhis2.org/2.38lytics/",
    "dhis2Username": ...,
    "dhis2Password": ...
    "dhis2InstanceVersion": "2.38"
}
```

Your desired username and password should be in double quotes.

#### `yarn cy:open`

Runs the tests locally in interactive mode.

#### `yarn cy:run`

Run the tests without interactive mode

#### Conditional E2E Test Recording

To record tests in Cypress Cloud, you can use one of the following methods based on your needs:

-   **Commit Message**: Include `[e2e record]` in your commit messages to activate recording.
-   **GitHub Labels**: Apply the `e2e record` label to your pull request to trigger recording.

This setup helps in managing Cypress Cloud credits more efficiently, ensuring recordings are only made when explicitly required.

#### Configure Cypress tests to run only on certain versions

Some tests may only be applicable to some supported versions of DHIS2 (DHIS2 officially supports the latest 3 released versions). For instance, if you add a feature to 2.39 that would not work on 2.38, then a test for that feature should only run on instances >=2.39, and should not run on instances <2.39. To configure a test to only run on certain versions, add a tag array as the first argument to the test's `describe` or `it`. You can add multiple tags to the array if that is relevant. Tags must be in the form of < <= > >= otherwise they will be ignored. In addition, the tags contain only the minor version, i.e., "39", not "2.39". Here are some tag examples, given a minimum supported version of 2.38:

```
it(['<39'], 'runs on 38 only', () => { test implementation })
it(['<=39'], 'runs on 38 and 39', () => { test implementation })
it(['>39'], 'runs on 40 and dev', () => { test implementation })
it(['>=39'], 'runs on 39, 40 and dev', () => { test implementation })
```

Tests without tags will run on all supported versions plus dev.

## Pull requests

### Open

Pull requests should be set to "draft" until they are ready for review. Why, you ask? Because the e2e test workflow on CI does not run on drafts. This helps to avoid overloading the cypress server unnecessarily, allowing the e2e runs on PRs that are ready to complete more quickly. When it's ready for review, remove the "draft" status and assign someone, and ping that person on the team's "PR" channel in Slack.

### Review

When reviewing, please don't approve until all the required checks have passed.

### Merge

PRs should be squash merged unless there is a good reason to preserve the individual commit history. Make sure the PR commit summary has the correct semantic release keyword (fix, feat, chore, etc). Keep line lengths in the description to <100 in order to avoid lint-commit errors in future PRs that have "merge from master" commits. The summaries and descriptions go into the release notes so make it good!

## Learn More

This project was bootstrapped with [DHIS2 Application Platform](https://github.com/dhis2/app-platform).
