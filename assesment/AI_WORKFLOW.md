# AI-Assisted Development Workflow

## 1. Overview

I used an AI-assisted development workflow to accelerate implementation while retaining responsibility for architectural decisions, code quality, and verification.

Rather than treating AI as a code-generation tool alone, I used it as an engineering collaborator for planning, implementation, debugging, and reviewing technical approaches.

## 2. AI Tools Used

- **Coding Agent:** Codex, JetBrains Junie Lite
- **Planning and Research:** ChatGPT
- **Development Environment:** 
  - JetBrains IDEs (WebStorm)
  - GitHub Copilot for code suggestions
  - Local development server for testing and debugging

## 3. My Development Process

I followed a structured, iterative workflow:

1. **Requirements and Planning:** I described the functionality, constraints, and expected behavior to the AI agent and asked it to propose an implementation plan before writing code.
2. **Plan Review:** I reviewed the proposed architecture, dependencies, implementation steps, and potential tradeoffs.
3. **Refinement:** When necessary, I requested changes to the plan based on technical considerations, project scope, or time constraints.
4. **Implementation:** Once satisfied with the plan, I instructed the agent to implement the approved solution.
5. **Code Review and Verification:** I reviewed generated changes, tested functionality, and requested corrections when necessary.

This approach allowed me to delegate repetitive implementation tasks while maintaining control over engineering decisions.

### Example of Iterative Development

- prompt:
```text
Implement email password authentication flow using better auth and add login and registration screen with required functionality. keep the screen  minimal. no need dark mode. white background and form in middle. use zod for validation along with shandcn form. add sensory shadcn components. after registration users redirect to home with small heder on top logo in the left (Drafty) and logout button right. any authenticated users not able to go to home or any route. so protect the routes.
```

- Agent Plan:
```md
# Email and Password Authentication

## Summary

Add Better Auth registration, login, and logout to the existing Next.js and Prisma app. Use minimal, centered forms on a white background, and protect the home page and future application routes.

## Implementation

- Mount Better Auth’s Next.js API handler and add a client for registration, login, and logout. Reuse the existing Prisma schema and email/password configuration.
- Add /login and /register pages with links between them. Registration collects name, email, and password; login collects email and password.
- Use React Hook Form, Zod, and shadcn form components for accessible field validation. Show authentication errors and disable submission while a request is pending.
- Redirect users to / after successful registration or login. Redirect authenticated users away from the auth pages to /.
- Add a default route gate that redirects unauthenticated page requests to /login, while allowing the auth pages, Better Auth endpoints, and required static assets. Validate the session on the server before rendering protected content; protected API handlers must also validate sessions and return 401 when unauthenticated.
- Replace the starter home page with a minimal layout and a header containing Drafty on the left and Logout on the right. Logout ends the session and redirects to /login.
- Update setup documentation with the database, Better Auth secret, and application URL configuration.

## Test Plan

- Verify registration creates a session and opens home; verify login works after logout.
- Check invalid inputs, duplicate registration, incorrect credentials, and request failures display useful errors.
- Verify unauthenticated access to home and other protected routes redirects to login, including with an expired or invalid session cookie.
- Verify authenticated users can access home, auth pages redirect to home, and logout prevents subsequent access.
- Run lint and production build, then exercise the flow against a configured PostgreSQL database.

## Assumptions

- Registration signs users in immediately; email verification and password reset are outside this request.
- The existing Prisma models are retained unless Better Auth compatibility checks reveal a required schema change.
- Future protected API handlers will perform their own server-side session validation in addition to the route gate.
```

## 4. Human Review and Corrections

I did not automatically accept every AI recommendation. I reviewed proposed solutions before implementation and requested adjustments when necessary.

**Example of an AI recommendation I changed or rejected:**

- Initial proposal: Agent finish implementing the authentication flow and try to run the dev server.
- My concern: Need to ensure the implementation pass the test plan and verify the flow works as expected.
- Change requested: Ask the agent to implement the flow and provide a test plan and implement it.
- Reason: I wanted to ensure the implementation was correct and met the requirements before running the dev server.

## 5. Verification and Quality Assurance

I verified the implementation using:

- [x] TypeScript and build checks — include only if performed.
- [x] Automated tests and actual results.
- [x] Manual testing of authentication, 
- [ ] Manual testing of document editing, and persistence.
- [ ] Manual testing of sharing and authorization.
- [x] Deployment verification.

Issues discovered during testing were investigated and corrected through additional iterations with the agent.

## 6. Reflection

This workflow allowed me to prioritize problem-solving, architecture, and product decisions while using AI to accelerate implementation.

The main lesson was that effective AI-assisted engineering depends on clear requirements, deliberate review, iterative refinement, and independent verification—not simply the amount of code generated by AI.
