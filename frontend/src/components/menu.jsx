import "../styles/menu.css";

export default function Menu() {
  return (
    <div className="left-menu">
      <header className="header">
        <div className="title">
          <div className="text-wrapper">Navigate</div>
          <div className="div">x</div>
        </div>
        <div className="search-bar">
          <div className="text-wrapper-2">Search...</div>
        </div>
      </header>
      <div className="divider" />
      <div className="clip-frame">
        <div className="selectors">
          <div className="filter-section">
            <div className="filter-container">
              <div className="filters">
                <div className="filter">
                  <div className="text-layout">
                    <div className="text-wrapper-3">Date</div>
                    <div className="text-wrapper-4">--/--/--</div>
                  </div>
                </div>
                <div className="filter">
                  <div className="text-layout">
                    <div className="text-wrapper-3">Start to End</div>
                    <div className="text-wrapper-4">-</div>
                  </div>
                </div>
                <div className="filter">
                  <div className="text-layout">
                    <div className="text-wrapper-3">Occupancy</div>
                    <div className="text-wrapper-4">-</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="div-2">
              <div className="text-wrapper-5">Equipment</div>
              <div className="div-2">
                <div className="checkbox">
                  <div className="box" />
                  <div className="text-wrapper-6">Whiteboard</div>
                </div>
                <div className="checkbox">
                  <div className="box" />
                  <div className="text-wrapper-6">Projector</div>
                </div>
                <div className="checkbox">
                  <div className="box" />
                  <div className="text-wrapper-6">Mic/speakers</div>
                </div>
                <div className="checkbox">
                  <div className="box" />
                  <div className="text-wrapper-6">Power Outlet</div>
                </div>
                <div className="checkbox">
                  <div className="box" />
                  <div className="text-wrapper-6">Extra Chairs/seating</div>
                </div>
              </div>
            </div>
          </div>
          <div className="filter-buttons">
            <button className="button">
              <div className="text-wrapper-7">Apply filters</div>
            </button>
            <button className="div-wrapper">
              <div className="text-wrapper-7">Reset filters</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
