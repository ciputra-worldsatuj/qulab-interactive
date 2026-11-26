/**
 * Helper render EJS dengan Shell Layout (Panel Dosen, Peserta HP, dan Proyektor)
 */
function renderWithLayout(res, view, data = {}, layout = 'layouts/admin-shell') {
  res.render(view, data, (err, html) => {
    if (err) {
      console.error(`[Render Error] Gagal merender view: ${view}`, err);
      return res.status(500).send(`Render Error: ${err.message}`);
    }
    res.render(layout, { ...data, body: html });
  });
}

module.exports = {
  renderWithLayout
};
