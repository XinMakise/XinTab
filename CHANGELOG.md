# Changelog

All notable changes to this project will be documented in this file.

Format: `[version] - YYYY-MM-DD` / type: `Added` `Changed` `Fixed` `Removed`

---

## [0.3.0] - 2026-04-22

### Added
- 三档文档体系（开发/测试/验收）统一建立
- Quick Edit 双栏拖拽对话框
- 书签拖拽排序与跨分类移动
- 最近访问拖入导航分类
- 共享 DnD 会话骨架（`useStandardPageDndSession` / `useDndLifecycleState`）
- 共享标准页布局层（`useStandardPageLayoutState` / `useStandardPageLinksContentModel`）
- CI 质量门禁（GitHub Actions）

### Changed
- 页面装配收敛为三级链路：`pages -> features/page -> features/model`
- DnD 落点解析收口到 `dndDropResolvers.ts` 纯函数层

### Fixed
- Quick Edit 搜索态下跨分类移动行为漂移问题

---

## [0.2.0] - 2026-03-18

### Added
- 书签页编辑、排序、删除链路
- 导入/导出（覆盖 + 合并两种模式）
- 自定义网站图标（preset / text / auto 三种模式）
- 外观系统（主题、透明度、背景图、字体）

---

## [0.1.0] - 2026-03-01

### Added
- 手动导航分类与链接管理
- Chrome 书签页展示
- 搜索栏与自定义搜索引擎
- 双运行模式（Chrome 扩展 / 独立 Web 应用）
