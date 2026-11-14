// PowerPoint engine for the presenter. Calls only web-ppt's public API, so the
// vendored copy under vendor/webppt/ stays untouched and upstream updates drop
// straight in.
export async function openPowerPoint(stage, data) {
  const [core, viewerModule] = await Promise.all([
    import("./vendor/webppt/core/core.js"),
    import("./vendor/webppt/viewer/viewer-core.js"),
  ]);
  const presentation = await core.parse(data);
  stage.replaceChildren();
  const viewer = new viewerModule.Viewer(stage, presentation, { animate: true });

  return {
    get count() { return viewer.count; },
    get index() { return viewer.index; },
    goTo(index) { viewer.goTo(index); },
    // next() plays a pending build before moving on, which is what a presenter
    // clicking through an animated deck expects.
    next() { viewer.next(); },
    prev() { viewer.prev(); },
    renderThumb(index, thumb) {
      thumb.insertAdjacentHTML(
        "beforeend",
        core.renderSlideToSvg(presentation, presentation.slides[index]),
      );
    },
  };
}
