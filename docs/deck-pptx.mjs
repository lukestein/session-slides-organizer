// PowerPoint engine for the presenter. Calls only web-ppt's public API, so the
// vendored copy under vendor/webppt/ stays untouched and upstream updates drop
// straight in.
export async function openPowerPoint(stage, data, onChange) {
  const [core, viewerModule] = await Promise.all([
    import("./vendor/webppt/core/core.js"),
    import("./vendor/webppt/viewer/viewer-core.js"),
  ]);
  const presentation = await core.parse(data);
  stage.replaceChildren();
  const viewer = new viewerModule.Viewer(stage, presentation, { animate: true });
  // Both fire for moves the viewer makes on its own, such as a click on a link
  // to another slide, as well as for the ones asked of it.
  viewer.onChange = () => onChange?.();
  viewer.onAnimStep = () => onChange?.();

  return {
    get count() { return viewer.count; },
    get index() { return viewer.index; },
    get step() { return viewer.animationDone; },
    get steps() { return viewer.animationTotal; },
    goTo(index) { viewer.goTo(index); },
    // next() plays a pending build before moving on, which is what a presenter
    // clicking through an animated deck expects.
    next() { viewer.next(); },
    prev() { viewer.prev(); },
    // Catches up with another window. A single step forward plays, so the
    // audience sees a build arrive as it would in PowerPoint; anything else
    // settles straight into place.
    show(index, step = 0) {
      if (index === viewer.index - 1 && viewer.animationDone === 0) {
        // Back a slide lands on its last build, as prev() does.
        viewer.prev();
      } else if (index !== viewer.index) {
        viewer.goTo(index, index > viewer.index ? "forward" : "backward");
      }
      if (step === viewer.animationDone + 1 && viewer.hasPendingAnimation) {
        viewer.playNextAnimation();
        return;
      }
      if (step > viewer.animationDone) viewer.finishAnimations();
      // prev() takes back one build at a time while the slide has any played.
      while (viewer.animationDone > step) viewer.prev();
    },
    notes(index) {
      return presentation.slides[index]?.notes?.trim() ?? "";
    },
    destroy() { viewer.destroy(); },
    renderThumb(index, thumb) {
      thumb.insertAdjacentHTML(
        "beforeend",
        core.renderSlideToSvg(presentation, presentation.slides[index]),
      );
    },
  };
}
