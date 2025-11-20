## Middle School Equipment Management — Feature-based monolith

Express + EJS app organized by feature/use case. Each feature owns its API layer (routes/controllers/services/repositories/models/validators) and its UI (views). Shared code lives in `src/core` and shared layouts/partials in `src/views`.

### 1) Quick start

```bash
npm install
node app.js  # http://localhost:3000
```

Environment/config:
- MongoDB: configured in `config/db.js`, invoked from root `app.js`.
- App settings: extend in `src/app.js` and `src/routes.js` if you progressively move bootstrapping logic inside `src/`.
- Env variables: centralize accessors in `src/config/env.js` if needed.
### 2) Project layout (high-level)

```text
src/
  app.js                 # initialize app, mount aggregated routes
  routes.js              # import and combine all feature routers
  config/                # db/env/logger
  core/                  # shared, feature-agnostic code (middlewares, utils, libs, constants)
  features/              # each subfolder = 1 feature/use case group
    <feature>/
      routes/ controllers/ services/ repositories/ models/ validators/ views/
  views/                 # optional shared layouts/partials
```

Current features: `auth`, `users`, `profile`, `suppliers`, `categories`, `devices`, `acceptance`, `periodic-reports`, `borrow`, `disposal`, `purchasing-plans`, `training-plans`, `reports`, `device-stats`.

### 3) Conventions per layer

- routes: Define Express endpoints, no business logic. Call controller only.
- controllers: Translate HTTP request/response; delegate to service.
- services: Business logic per use case; orchestrate repository calls; return plain data/DTOs.
- repositories: DB access only (Mongoose). No business logic.
- models: Mongoose schemas/models.
- validators: Request validation (e.g., Joi/Zod); plug into route via validation middleware.
- views: EJS templates per feature. Shared layout/partials live in `src/views`.

### 4) Aggregating routes

Import each feature router into `src/routes.js` and mount them with a clear prefix.

```js
// src/routes.js
const express = require('express');
const router = express.Router();

// Example imports (fill in as features are implemented)
// const devicesRoutes = require('./features/devices/routes/devices.routes');
// router.use('/devices', devicesRoutes);

module.exports = router;
```

Then in `src/app.js` (or root `app.js` if you wire from there), use the aggregated router:

```js
const express = require('express');
const app = express();
const routes = require('./routes');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.use(routes);

module.exports = app;
```

The root `app.js` at repository top-level already starts the server on port 3000.

### 5) Views & layouts

- Use shared layout in `src/views/layouts/main.ejs` and partials in `src/views/partials`.
- Feature views live inside `src/features/<feature>/views`.
- When rendering: `res.render('devices/list', data)` if you register feature view paths with Express, or render using relative paths depending on your view engine setup.

### 6) Adding a new feature (workflow for each dev)

1. Create folder `src/features/<feature>` with subfolders: `routes, controllers, services, repositories, models, validators, views`.
2. Implement endpoints in `routes/<feature>.routes.js`; wire validators and controllers.
3. Implement business logic in `services` and persistence in `repositories`.
4. Define Mongoose schemas in `models`.
5. Add EJS pages (if needed) in `views`.
6. Register the router in `src/routes.js` with a clear prefix.

### 7) Shared middlewares (src/core/middlewares)

- `auth.middleware.js`: authentication/authorization hooks.
- `error.middleware.js`: centralized error handling (send consistent JSON/EJS responses).
- `validation.middleware.js`: apply request schema validation.

### 8) Utilities and constants

- `src/core/utils/*`: helpers (pagination, date utilities, standardized responses).
- `src/core/constants/*`: roles, permissions, error codes.
- `src/core/libs/*`: integrations (mailer, storage) with thin wrappers.

### 9) Data & validation flow

Request -> route (validate) -> controller -> service -> repository -> model.

Keep controllers thin; put business rules in services; keep repositories pure for DB.

### 10) Scripts (suggested)

Add these to `package.json` when ready:

```json
{
  "scripts": {
    "dev": "node app.js",
    "lint": "eslint .",
    "test": "jest"
  }
}
```

### 11) Migrating existing code

- Old product demo has been superseded by the `devices` feature. Move any remaining logic or views into `src/features/devices`.
- If you still have legacy `controllers/`, `routes/`, `models/` at the repo root, migrate them into feature folders and delete the old paths once verified.

### 12) Collaboration guide (team)

- Feature ownership: each dev works inside `src/features/<feature>` (both API & EJS UI).
- No cross-import between features. If something is shared, extract into `src/core`.
- DTO/Response format: use helpers in `src/core/utils/response.js` for consistent success/error shapes.
- Validation: keep request schemas in `validators/` and apply via `validation.middleware.js`.
- Routing prefixes: one clear prefix per feature (`/devices`, `/borrow`, ...). Register in `src/routes.js`.
- Tests: place next to feature or under `tests/<feature>`.
- Git: branches `feat/<feature>-<desc>`; conventional commits; PR requires lint/tests and no cross-feature imports.

### 13) Deployment

- Environment: Node 18+, MongoDB reachable from app.
- Install deps: `npm ci`
- Start process: `node app.js` or use PM2/systemd in production.
- Logging: implement `src/config/logger.js` bindings as needed (`pino`/`winston`).
- Env configuration: keep secrets out of VCS; reference them in `config/env.js` or load from `.env`.

### 14) Feature-by-feature guide (what to code where)

Below is a quick brief so each dev knows exactly where to work inside a feature.

Auth (`src/features/auth`)
- Purpose: login, logout, change password, forgot password
- routes/auth.routes.js: `/login`, `/logout`, `/password/change`, `/password/forgot`
- controllers/auth.controller.js: handle form submit, session/cookie, redirect
- services/auth.service.js: credential check, password hashing, token/email flows
- repositories/auth.repo.js: user lookups, password update
- models/user.model.js: User schema
- validators/auth.validators.js: login/change/forgot schemas
- views/: `login.ejs`, `change-password.ejs`, `forgot-password.ejs`

Users (`src/features/users`)
- Purpose: admin manage users (create/edit/delete/list)
- routes/users.routes.js: `/users` list, `/users/:id`, create/edit/delete endpoints
- controllers/users.controller.js: thin; map form/query to service
- services/users.service.js: business rules (unique email/role checks)
- repositories/users.repo.js: CRUD on users
- models/user.model.js: if not shared, keep here; else move to core later
- validators/users.validators.js: create/update schemas
- views/: `index.ejs`, `detail.ejs`, `create.ejs`, `edit.ejs`

Profile (`src/features/profile`)
- Purpose: personal profile and password change for current user
- routes/profile.routes.js: `/profile`, `/profile/password`
- controllers/services/validators similar to `auth` but scoped to self
- views/: `profile.ejs`, `change-password.ejs`

Suppliers (`src/features/suppliers`)
- Purpose: manage suppliers
- Typical endpoints: `/suppliers` list/detail/create/edit/delete
- repos/model: `supplier.model.js` + CRUD in `suppliers.repo.js`
- views/: `list.ejs`, `detail.ejs`, `create.ejs`, `edit.ejs`

Categories (`src/features/categories`)
- Purpose: manage device categories
- Endpoints similar to suppliers; model `category.model.js`
- views/: `list.ejs`, `detail.ejs`, `create.ejs`, `edit.ejs`

Devices (`src/features/devices`)
- Purpose: device registry CRUD + search
- routes: `/devices` list/search/create/edit/delete
- services: enforce unique codes, state transitions if any
- repos/model: `device.model.js`
- validators: create/update/search filters
- views/: `list.ejs`, `search.ejs`, `create.ejs`, `edit.ejs`, `confirm-delete.ejs`

Acceptance (`src/features/acceptance`)
- Purpose: new device acceptance records (view/edit/delete-item)
- routes: `/acceptance` + child operations
- repos/model: `acceptance.model.js`, nested items
- views/: `list.ejs`, `edit.ejs`, `delete-item.ejs`

Periodic Reports (`src/features/periodic-reports`)
- Purpose: periodic device condition reports
- routes: `/periodic-reports` list/detail/create/edit
- model: `periodic-report.model.js`
- views/: `list.ejs`, `detail.ejs`, `create.ejs`, `edit.ejs`

Borrow (`src/features/borrow`)
- Purpose: request borrow, approval queue, return, history, detail, cancel
- routes: `/borrow`, `/borrow/approve`, `/borrow/return`
- model: `borrow-ticket.model.js`; repo: ticket + items
- views/: `register.ejs`, `pending-approvals.ejs`, `history.ejs`, `detail.ejs`, `cancel.ejs`

Disposal (`src/features/disposal`)
- Purpose: damaged device disposal reports + approval
- routes: `/disposal` search/list/detail/create/edit/delete/approve
- model: `disposal-report.model.js`
- views/: `search.ejs`, `list.ejs`, `edit.ejs`, `create.ejs`, `confirm-delete.ejs`, `approve.ejs`

Purchasing Plans (`src/features/purchasing-plans`)
- Purpose: planning purchases + approval flow
- routes: `/purchasing-plans` list/create/edit/delete/approve
- model: `purchasing-plan.model.js`
- views/: `list.ejs`, `create.ejs`, `edit.ejs`, `confirm-delete.ejs`, `approve.ejs`

Training Plans (`src/features/training-plans`)
- Purpose: training plan management + reporting page
- routes: `/training-plans` list/create/edit/delete/report
- model: `training-plan.model.js`
- views/: `list.ejs`, `create.ejs`, `edit.ejs`, `confirm-delete.ejs`, `report.ejs`

Reports (`src/features/reports`)
- Purpose: analytical/statistical pages not tied to a single entity
- routes: `/reports` (e.g., `/reports/damaged-summary`)
- views/: `damaged-summary.ejs`

Where to start in a feature
- Define API first in `routes/*.routes.js` and mount in `src/routes.js` with a prefix
- Add validators, then controllers/services/repos/models incrementally
- Build views for the forms and lists, reuse `src/views/layouts/main.ejs`

### 15) Use case coverage (from usecase.rtf)

This matrix shows where each documented use case should be implemented.

- Đăng nhập/Đăng xuất/Đổi mật khẩu/Quên mật khẩu → `features/auth`
  enpoint:`/login`, `/logout`, `/password/change`, `/password/forgot`
- Quản lý biên bản nghiệm thu thiết bị mới (xem/sửa/xóa chi tiết) → `features/acceptance`
  enpoint: `/acceptance`, item operations inside feature
- Quản lý báo cáo tình trạng thiết bị định kỳ → `features/periodic-reports`
  enpoint: `/periodic-reports` list/detail/create/edit
- Duyệt mượn thiết bị / Duyệt trả thiết bị → `features/borrow`
  enpoint: `/borrow/approve`, `/borrow/return`
- Đăng ký mượn, Xem chờ duyệt, Lịch sử mượn/trả, Xem chi tiết, Hủy phiếu → `features/borrow`
  enpoint: `/borrow`, `/borrow/pending`, `/borrow/history`, `/borrow/:id`, `/borrow/:id/cancel`
- Báo cáo thanh lý thiết bị hỏng (tìm kiếm/xem/sửa/thêm/xóa) → `features/disposal`
  enpoint: `/disposal` search/list/detail/create/edit/delete
- Xét duyệt thanh lý thiết bị hỏng → `features/disposal`
  enpoint: `/disposal/approve`
- Quản lý nhà cung cấp (tìm kiếm/xem/thêm/sửa/xóa) → `features/suppliers`
  enpoint: `/suppliers`
- Quản lý danh mục thiết bị (tìm kiếm/xem/thêm/sửa/xóa) → `features/categories`
  enpoint:`/categories`
- Quản lý thiết bị (xem danh sách/tìm kiếm/thêm/sửa/xóa) → `features/devices`
  enpoint: `/devices`
- Xem báo cáo thống kê thiết bị hỏng → `features/reports`
  enpoint: `/reports/damaged-summary`
-- Thống kê thiết bị (tổng hợp theo danh mục/tình trạng/nhà cung cấp, v.v.) → `features/device-stats`
  enpoint: `/device-stats` (overview) và các nhánh con nếu cần
- Quản lý kế hoạch đào tạo + Xem báo cáo kế hoạch đào tạo → `features/training-plans`
  enpoint:`/training-plans`, `/training-plans/report`
- Quản lý thông tin cá nhân/Đổi mật khẩu cá nhân → `features/profile`
  enpoint:`/profile`
- Quản lý kế hoạch mua sắm (lập/sửa/xóa/xem) → `features/purchasing-plans`
  enpoint:`/purchasing-plans`
- Xét duyệt mua sắm thiết bị → `features/purchasing-plans`
  enpoint: `/purchasing-plans/approve`
- Quản lý thông tin người dùng (tạo/sửa/xóa) → `features/users`
  enpoint:`/users`


