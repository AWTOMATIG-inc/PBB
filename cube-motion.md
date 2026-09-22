# Cube (cube-motion)

> A zero-dependency JavaScript animation library for four fixed UI motions on the Web Animations API. Optional React, Vue, Solid and Svelte adapters.

Website: https://cube-motion.dev/
Source: https://github.com/danielwh2/cube-motion
Author: Daniel White
License: MIT

## Install

Package: https://www.npmjs.com/package/cube-motion

Install with `npm i cube-motion`.

## Page sections

- [JavaScript API](https://cube-motion.dev/#api)
- [React](https://cube-motion.dev/#react)
- [Design choices](https://cube-motion.dev/#why)
- [FAQ](https://cube-motion.dev/#faq)

## Which function

- Content appearing on load or mount: rise.
- Content disappearing before removal: leave; await its animations before removing the node.
- An icon or label changing state: morph; both faces stay mounted.
- Cards animating as the user scrolls: reveal.
- A button reacting to a press: CSS, `button:active { scale: 0.97 }` with a transition. Not this library.
- Timelines, gestures, layout animation: Motion or GSAP.

## JavaScript API

```ts
import { rise, leave, morph, reveal } from "cube-motion";

type Targets = string | Element | Iterable<Element>;

rise(elements: Targets, options?: { targets?: "self" | "children"; stagger?: number; delay?: number }): Animation[];
leave(elements: Targets, options?: { targets?: "self" | "children"; stagger?: number; delay?: number }): Animation[];
morph(outgoing: Element, incoming: Element): Animation[];
reveal(elements: Targets, options?: { targets?: "self" | "children"; stagger?: number; root?: Element | null }): () => void; // cleanup
```

- rise: fade in with a 12px lift over 640ms; default stagger 70ms, delay 0ms, fill: backwards. Returns one Animation per target.
- leave: fade out with a 12px drop over 320ms; default stagger 40ms, delay 0ms, fill: both. Holds the interrupted starting state through any delay and the end state until the node is removed or risen again. Returns one Animation per target.
- morph: content-aware. Text faces diff by grapheme: shared leading letters stay still; other letters blur out and in over 180ms each with a 35ms stagger, incoming starts 60ms later. Temporary inert, aria-hidden sibling overlays preserve the original text nodes and accessible labels; emoji and combining marks stay together. Without Intl.Segmenter, or for icons and other content, whole faces crossfade: outgoing fades, scales to 0.8 and blurs by 4px over 220ms; incoming starts 130ms later. The parent eases its width over 400ms. Returns Animation[]; temporary copies are removed on completion or cancellation.
- reveal: hides targets immediately, then runs rise once when they enter view. Default stagger 60ms; root defaults to the viewport. The bottom inset is 10% of the scroll root's height measured at binding. Cleanup disconnects the observer, restores waiting targets' authored opacity and cancels active entrances. Duplicate or stale observer notifications are ignored.

The supplied element moves by default. targets defaults to "self" in core functions, components and hooks; "children" selects direct element children: `rise(".hero", { targets: "children" })`. Target lists are captured when a binding starts; rebind to include children added later.

Durations, easing, distance and scale are fixed. Stagger and delay control timing; root selects the scroll container. The curve is cubic-bezier(0.2, 0, 0, 1). Calls read the current computed state before cancelling running animations, so interrupted motions retarget smoothly. Cancelled animations reject finished with AbortError: catch cancellation and do not remove a node whose exit was interrupted.

Imports are SSR-safe; call the core with browser DOM elements after they mount. It requires the Web Animations API and IntersectionObserver for reveal; no polyfills are bundled. Motions respect reduced motion when they start, including each reveal entrance. Opacity changes stay; translation, scale and blur go.

For vanilla morph, give both faces one relatively positioned, inline-flex parent. The active face stays in flow and sizes the parent; the inactive face uses position: absolute, inset: 0 and opacity: 0. Set white-space: nowrap and will-change: opacity, filter, scale on both faces, and aria-hidden="true" inert on the initially inactive face. morph swaps flow and accessibility on every call. Framework Morph components set up this layout and initial accessibility themselves.

## React

```tsx
import { Rise, Morph, Reveal } from "cube-motion/react";

<Rise as="section" targets="children"><h2>Hello</h2><p>Welcome.</p></Rise>
<Rise show={open} className="toast">Saved</Rise>
<Morph active={saved} off="Save" on="Saved" />
<Reveal as="ul" targets="children">{items}</Reveal>
```

React 18 or 19 is an optional peer dependency. Components accept an as prop for the element or a ref-forwarding component, pass through element props, and merge the caller's ref. Defaults: Rise and Reveal render div; Morph renders span.

Rise accepts show, targets, stagger and delay. With show, turning it false runs leave on the selected targets, waits for the animations, then unmounts; turning it true retargets the entrance. Initially false renders nothing. Reveal accepts targets, stagger and root. Morph accepts active, off and on; its inactive face is absolute, transparent, inert and aria-hidden from the first render. Hooks are exported as useRise(options?), useMorph(active), and useReveal(options?). Each creates refs for the caller to attach; useMorph returns [offRef, onRef]. Attach refs in the component calling the hook so its commits detect replacement nodes. Components and hooks default to their own element; choose targets: "children" for groups. Effects run on the client. The React subpath includes its "use client" boundary for React Server Component frameworks.

## Vue

```vue
<script setup>
import { Rise, Morph, Reveal } from "cube-motion/vue";
</script>

<template>
  <Rise :show="open" class="toast">Saved</Rise>
  <Morph :active="saved" off="Save" on="Saved" />
  <Reveal as="ul" targets="children"><li v-for="item in items" :key="item.id">{{ item.title }}</li></Reveal>
</template>
```

Same components and props. Morph faces come from the off and on props or the #off and #on slots. Attrs fall through to the element. Custom as components need a single element root.

## Solid

```tsx
import { Rise, Morph, Reveal } from "cube-motion/solid";

<Rise show={open()} class="toast">Saved</Rise>
<Morph active={saved()} off="Save" on="Saved" />
<Reveal as="ul" targets="children">{items}</Reveal>
```

Same components and props. Solid conventions: class, ref as a variable or callback, reactive reads. Bindings run on the client and are released in onCleanup.

## Svelte

```svelte
<script>
  import { rise, leave, morph, reveal } from "cube-motion/svelte";
</script>

{#if open}<div in:rise out:leave>Saved</div>{/if}
{#each items as item, i}<li in:rise={{ index: i }}>{item}</li>{/each}
<button>
  <span class="faces" use:morph={saved}>
    <span class:inactive={saved} aria-hidden={saved} inert={saved}>Save</span>
    <span class:inactive={!saved} aria-hidden={!saved} inert={!saved}>Saved</span>
  </span>
</button>
<ul use:reveal={{ targets: "children" }}>…</ul>

<style>
  .faces { position: relative; display: inline-flex; align-items: center; }
  .faces > span { display: inline-flex; white-space: nowrap; }
  .inactive { position: absolute; inset: 0; opacity: 0; }
</style>
```

Svelte owns exit through out:, so rise and leave are transitions and there is no show prop. morph and reveal are actions; use:morph requires exactly two child faces. Actions run only on the client: the styles and inactive attributes above establish the initial state during SSR, before actions mount. use:reveal observes its own element by default. index staggers list items by the job's own stagger. Works on Svelte 4 and 5.

All four frameworks are optional peer dependencies: React >=18 <20, Vue >=3.4 <4, Solid >=1.8 <2 and Svelte >=4 <6. The core has zero runtime dependencies.

## Rules

- Never add duration, easing, distance or scale options. A motion that feels wrong wants a new job, not a knob.
- Do not animate unmount by hand. Use show in React, Vue and Solid, out:leave in Svelte.
- There is no stylesheet to import.

## Scope

Cube handles entrances, exits, state changes and scroll reveals. It does not provide timelines, spring physics, gestures or layout animation. Motion and GSAP are alternatives when those controls are needed.
