function x(l, u = "No comments on this slide") {
  const n = l.ownerDocument, r = n.createElement("section"), a = n.createElement("ol"), o = n.createElement("p");
  r.dataset.commentsPanel = "", o.dataset.commentsEmpty = "", o.textContent = u, a.style.paddingInlineStart = "28px", r.append(a, o), l.append(r);
  let c = !1;
  return {
    setSlide(s) {
      if (c) return;
      a.replaceChildren();
      const d = (s == null ? void 0 : s.comments) ?? [];
      o.hidden = !!d.length, a.hidden = !d.length, d.forEach((t, i) => {
        const e = n.createElement("li"), m = n.createElement("strong"), p = n.createElement("p");
        if (e.dataset.commentId = t.id ?? `source:${i}`, t.parentId && (e.dataset.parentCommentId = t.parentId, e.style.marginInlineStart = "20px"), e.value = t.idx ?? i + 1, e.style.marginBlock = "16px", m.textContent = t.author, p.textContent = t.text, p.style.whiteSpace = "pre-wrap", p.style.overflowWrap = "anywhere", e.append(m), t.date) {
          const h = n.createElement("time");
          h.textContent = ` · ${t.date}`, e.append(h);
        }
        e.append(p), a.append(e);
      });
    },
    dispose() {
      c = !0, r.remove();
    }
  };
}
export {
  x as createCommentsPanel
};
