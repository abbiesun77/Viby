# Viby Design Spec

Date: 2026-06-24
Status: Draft for review

## 1. Product Summary

Viby is a web app for AI video pre-production. It helps a user turn an idea, a paragraph, or a screenplay into a more controllable video-generation package. Instead of trying to be a heavy all-in-one video generation platform, Viby focuses on the steps before and after generation that most affect stability:

- shaping the story into scenes and shots
- identifying which reference materials are still missing
- generating visual references such as character sheets, three-view character images, scene setting images, prop references, and style anchors
- exporting organized assets and instructions for downstream video models
- helping the user recover when a generated video is close but not good enough

The core product promise is simple: help users do less blind "pulling cards" and get a more stable result from AI video tools.

## 2. Product Positioning

Viby is a director-style copilot for AI video creation. It should feel like a practical production assistant that knows what a user still needs before asking a video model to generate.

Viby is not:

- a node-based workflow canvas
- a heavy video rendering platform
- a multi-provider orchestration dashboard for every possible model

Viby is:

- a guided director workflow
- a project-based asset organizer
- a reference-generation assistant
- a failure-diagnosis and repair assistant

## 3. Target Users

The product should be friendly enough for non-experts while still useful to more experienced AI creators.

Primary launch audience:

- internal department teammates using it as a vibe coding project and practical creation tool

Secondary external audience:

- solo AI short-film creators
- small creative teams making story-based ads or branded shorts
- beginners who need step-by-step guidance

The primary product mode for V1 is "director mode": users usually already have an idea or rough script and want to quickly move from concept to storyboard and reference package.

## 4. AI Modes

Viby supports two AI usage modes from V1:

### 4.1 Bring Your Own Key

The user supplies their own API key and base URL. This mode is for power users, cost-sensitive users, and teammates who already have access to a relay or compatible endpoint.

### 4.2 Viby AI

The user uses hosted Viby-managed AI capabilities without having to configure their own key. This mode should be designed as the future monetization path.

### 4.3 Trial Credits

Newly registered users should receive a limited amount of Viby Credit so they can try the product without preparing their own key first.

The intended V1 trial model:

- a user registers or logs in
- the user receives an initial Viby Credit balance
- the balance can be used on selected Viby AI actions during trial
- after the trial is exhausted, the user is prompted to add their own API key and base URL to continue generating
- future paid plans can later extend or refill Viby Credit without changing the core flow

Implications:

- the product must not block users with configuration before they can start a project
- the product must clearly show which mode is active before a generation action runs
- settings and billing-like controls must be designed so that Viby AI can later become a paid feature without reshaping the whole product
- trial users should be able to feel the product's value before they are asked to configure their own infrastructure

## 5. Core Product Principle

Viby should act like a director assistant, not just a prompt wrapper.

It should understand:

- what kind of video the user wants to make
- what style and tone they are aiming for
- what reference materials are still needed
- whether a bad result should be regenerated from better inputs or repaired through editing

The system should guide the user toward preparation, not just generation.

## 6. Language and Terminology Strategy

Viby should default to plain Chinese in the UI. It must not assume that users understand film-production jargon.

Rules:

- use Chinese-first labels
- explain specialist concepts inline when needed
- use professional English terms only as secondary support
- teach in context instead of forcing the user into a separate documentation flow

Examples:

- "镜头清单" instead of "shot list" as the primary visible label
- "前后连贯说明" instead of "continuity notes" as the primary visible label
- "场景定调图" instead of "establishing shot reference" as the primary visible label

The tone should feel capable, practical, and non-pretentious.

## 7. Core User Flow

The default user journey for V1:

1. User starts from one of three entry paths:
   - 一句话脑暴
   - 段落转分镜
   - 导入剧本
2. System generates a story brief and scene breakdown
3. System proposes structured storyboard shots
4. System checks for missing references and setup materials
5. User generates or uploads character, scene, prop, and style assets
6. User reviews and adjusts storyboard cards and assets
7. User exports a package for downstream video generation
8. If result quality is poor, user enters repair flow:
   - go back and fill missing materials
   - or use Omni-targeted editing guidance

This flow is intentionally lighter than a full production suite and more structured than a simple prompt form.

## 8. Landing, Entry, and Onboarding Design

V1 should include a polished landing page before the product workspace.

The landing page has three jobs:

- explain what Viby is in plain Chinese
- make the value legible for first-time users
- route the user into registration or sign-in

The landing page should communicate:

- Viby helps turn an idea or script into storyboard shots and stable reference materials
- Viby reduces wasted retries in downstream AI video generation
- Viby can guide beginners while still supporting more advanced creators
- new users can try Viby using trial credits before bringing their own key

The landing page should feel beautiful, clear, and product-like rather than technical or dashboard-like.

After the landing page, the user reaches authentication.

Authentication requirements for V1:

- sign up with email
- sign in with email
- verify email ownership during sign-up or sign-in flow

Phone-based authentication is deferred to a later version.

After authentication:

- the user is taken into their project space
- the initial onboarding explains their current Viby Credit balance
- the user is told they can either use Viby AI trial credit or later switch to their own key
- the UI presents Viby Credit as points rather than as a vague trial state

The homepage uses a three-path entry model:

- 一句话脑暴
- 段落转分镜
- 导入剧本

The chosen default post-entry action is:

- first generate a concise brief and scene breakdown before diving into shot-level detail

Reasoning:

- beginners are less likely to get overwhelmed
- the narrative backbone can be validated before visual detail explodes
- later shot generation becomes more stable when guided by the brief and scenes

The in-product homepage should feel lightweight and welcoming, not like an admin dashboard.

## 9. Product Approach Chosen for V1

Three possible product levels were considered:

- lightweight director tool
- director tool with asset workspace
- mini all-in-one AI studio

The selected approach is:

- director tool with asset workspace

Reasoning:

- a pure lightweight generator risks feeling like a fancy prompt wrapper
- a heavy AI studio risks becoming intimidating, ugly, and difficult to adopt
- Viby's strongest product value is the combination of guided story planning and structured reusable reference assets

## 10. Core Pages

### 10.1 Homepage

Purpose:

- get the user into a project with minimal friction

Content:

- lightweight project home after login
- three entry paths
- recent projects
- visible but non-blocking AI mode awareness
- current Viby Credit point balance for trial users

The user should not be forced into settings before they can start.

### 10.0 Landing Page

Purpose:

- explain the product clearly
- create desire to try it
- route the user into login or registration

Content:

- clear statement of what Viby does
- visual explanation of the workflow from idea to storyboard to reference pack
- product benefits for reducing unstable video generation outcomes
- visible call to action for trying Viby with credit
- entry points for sign up and sign in

This page exists because Viby is intended to become a product, not just an internal tool.

### 10.2 Project Overview Page

Purpose:

- act as a director dashboard for a single project

Content:

- story brief summary
- scene progress
- shot count
- asset count
- missing-material reminders
- latest export status
- latest repair status

This page should answer: what state is this project in, and what is the next best action?

### 10.3 Storyboard Page

Purpose:

- serve as the core production surface

Each storyboard card should include:

- shot number
- scene link
- shot purpose
- subject
- action
- location/scene
- shot scale / angle / composition
- lighting / color / mood
- estimated duration
- continuity requirements
- linked references
- readiness status

Primary actions:

- refine the shot
- fill missing references
- generate shot-specific reference imagery

### 10.4 Asset Page

Tabs:

- 角色
- 场景
- 道具
- 风格锚点

Purpose:

- turn references into reusable project assets instead of one-off image outputs

An asset should be easy to inspect, reuse, replace, mark as approved, and see across multiple linked shots.

### 10.5 Result Diagnosis Page

Purpose:

- support post-generation recovery when the result is unsatisfactory

It should help determine:

- what is wrong
- whether the problem should be solved by regenerating from better prep
- whether the problem is good enough for Omni-based low-cost editing

### 10.6 Export Page

Purpose:

- package project materials for downstream video tools

Output types:

- 镜头清单
- 参考图合集
- 角色设定图
- 场景设定图
- 道具图
- 风格锚点图
- 前后连贯说明
- Seedance-oriented generation notes
- Omni-oriented edit notes

## 11. Viby Director Skills

Viby should include a guided assistant layer that behaves like a director-minded copilot.

### 11.1 Style Interview

The system helps the user clarify:

- realism vs ad-like polish vs cinematic tone vs animation
- vertical vs horizontal format
- fast vs slow pacing
- stable vs dynamic camera feeling
- inspiration references

### 11.2 Story to Scenes

The system turns a rough idea or paragraph into a concise story brief and scene plan.

### 11.3 Scenes to Shots

The system expands scenes into structured shot cards.

Recommended fields are inspired by common public video-prompting guidance:

- subject
- subject motion
- scene
- camera language
- lighting
- atmosphere

These fields should be productized as structured controls rather than exposed as prompt theory.

### 11.4 Missing Material Detection

The system should actively identify gaps such as:

- main character missing three-view reference
- key scene missing a wide setup image
- important prop missing an isolated reference
- project style still too weakly anchored

### 11.5 Model-Aware Export Guidance

Viby does not need to run heavy video generation itself, but it should package materials differently depending on the downstream target.

V1 targets:

- Seedance generation handoff
- Omni edit handoff

## 12. Recovery and Omni Repair Flow

Viby must acknowledge that users will still get poor video outputs even after careful prep.

Therefore, Viby should support a post-generation repair loop.

Two repair branches:

### 12.1 Regeneration Branch

Use when the result failed because preparation was too weak or incomplete.

Examples:

- character identity is unstable because references were insufficient
- scene layout is unclear
- action is underspecified
- style consistency is not anchored enough

In this branch, Viby should point the user back to the exact missing assets or unclear shot definitions.

### 12.2 Omni Editing Branch

Use when the generated video is close enough and should be cheaply polished instead of rebuilt.

Examples:

- preserve subject identity but refine facial expression
- keep composition but adjust the movement
- preserve most content but unify atmosphere
- keep the scene and camera move, but alter gesture timing

The system should ask the user what they dislike and convert that complaint into clearer edit instructions.

The result diagnosis experience should feel like a repair triage assistant.

## 13. Core Data Objects

V1 should be built around these core domain objects.

### 13.1 Project

Represents one creative project.

Suggested fields:

- id
- title
- summary
- target format
- target style
- input type
- current workflow state
- active AI mode

### 13.2 Creative Brief

Represents the project's high-level creative intent.

Suggested fields:

- project id
- genre or video type
- style goals
- pacing intent
- emotional tone
- references
- key creation goal

### 13.3 Scene Plan

Represents one scene or story segment.

Suggested fields:

- project id
- scene number
- scene title
- narrative purpose
- main characters
- main setting
- emotional function
- estimated shot count
- storyboard completion state

### 13.4 Shot Card

Represents one storyboard shot.

Suggested fields:

- project id
- scene id
- shot number
- purpose
- subject
- action
- setting
- framing and camera
- lighting
- mood
- estimated duration
- continuity requirements
- required asset ids
- readiness state

### 13.5 Asset

Represents a reusable project reference.

Asset subtypes:

- character
- scene
- prop
- style
- shot reference

Suggested fields:

- project id
- asset type
- name
- description
- source type
- image path or URL
- linked shot ids
- anchor status
- approval status

### 13.6 Gap Task

Represents a detected missing item that blocks or weakens output quality.

Examples:

- missing character three-view
- missing scene-wide setup reference
- missing prop reference
- missing style anchor

Suggested fields:

- project id
- related scene or shot or asset
- issue type
- explanation
- suggested action
- severity
- status

### 13.7 Review / Repair Task

Represents dissatisfaction after video generation.

Suggested fields:

- project id
- related shot or export
- complaint category
- user complaint
- suggested regenerate path
- suggested Omni edit prompt
- resolution state

### 13.8 Export Package

Represents a versioned handoff bundle.

Suggested fields:

- project id
- export target
- included assets
- included storyboard items
- included notes
- generated time
- version label

## 14. Suggested System Architecture

V1 architecture should prioritize clarity and replaceability.

Recommended layers:

- landing and auth layer
- frontend project workspace
- backend project and asset service
- AI orchestration layer
- model access layer for BYOK and Viby AI
- export packaging layer

The durable product value is in project structure, asset coordination, and workflow logic rather than in any single model provider.

## 15. Error Handling Principles

Errors should be user-actionable whenever possible.

### 15.1 Configuration Errors

Examples:

- invalid API key
- invalid base URL
- unavailable hosted Viby AI route

The product should clearly distinguish:

- your own key failed
- Viby AI is unavailable

### 15.2 Generation Errors

Examples:

- image generation failed
- timeout
- empty or invalid response

The product should suggest next actions such as retrying, simplifying the request, or using existing references.

### 15.3 Project Completeness Warnings

Examples:

- export attempted while key references are still missing

The product should warn that output stability may be weaker without fully blocking progress.

### 15.4 Quality Failures

These are not technical crashes. They are bad-but-usable or bad-and-unusable outputs.

The product should route these into either:

- better-prep regeneration
- Omni repair assistance

## 16. Scope Control

### 16.1 V1 In Scope

- landing page
- email / phone sign up and sign in
- initial Viby Credit trial model
- three entry paths
- guided creative brief generation
- scene generation
- storyboard generation
- character / scene / prop / style reference generation
- missing-material checks
- post-result diagnosis
- Omni edit prompt assistance
- Seedance / Omni export pathways
- BYOK / Viby AI support

### 16.2 V1 Out of Scope

- built-in heavy video generation
- infinite canvas tools
- node-based workflow editor
- broad multi-model marketplace integrations
- complex team permission systems
- advanced billing infrastructure beyond basic credit display and gating

## 17. Validation and Success Metrics

The most important V1 validation questions are workflow questions, not raw API questions.

Key validation goals:

- can a new user move from a rough idea to a structured project quickly
- can users understand the pages without film-school knowledge
- are missing-material suggestions actually useful
- does the exported package improve downstream video-generation stability
- when users dislike a result, can they naturally choose between regeneration and Omni repair

V1 success looks like:

- teammates genuinely use it for real projects
- users describe it as a helpful director assistant
- users feel more in control than when directly prompting a video model
- users know what to do next after a bad result
- hosted Viby AI feels valuable enough to support future paid usage

## 18. Open Implementation Notes

Useful external inspirations and references identified during brainstorming:

- Wonder Unit Storyboarder for storyboard-centered workflow patterns
- mjj-ai-studio for overall product direction, but not its heavy UI style
- screenplay parsers for structured script ingestion
- public video-prompting guidance from providers such as Runway and Kling

These are inspiration points, not mandatory architectural dependencies.

## 19. Authentication Recommendation for V1

For V1, the recommended authentication path is email-only authentication with email verification.

Reasoning:

- it is much simpler for a solo developer to ship and maintain
- it avoids SMS cost and region-specific delivery issues
- it matches the product need for low-friction trial onboarding

Recommended implementation direction:

- support email registration and sign-in first
- use email verification code or email link as the verification mechanism
- defer phone number authentication to a later paid-growth stage if it proves necessary

Viby Credit should be presented as a point balance.

Reasoning:

- both text generation and image generation consume value differently
- points give more flexibility than "remaining generations"
- points create a cleaner bridge to future hosted monetization
