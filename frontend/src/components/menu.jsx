
import { input } from "bootstrap";
import "../styles/menu.css";

export default function Menu() {
  return (
    <div className="left-menu">
      <div className="head">
        Navigate
      </div>

      <div class="container mt-2">
        <div class="row justify-content-center">
          <div class="input-group mb-3 sbar">
            <input type="text" class="form-control rounded-pill" placeholder="Search..." aria-label="Search" aria-describedby="basic-addon2" />
          </div>
        </div>
      </div>

      <hr class="white-line"></hr>

      <div class="fields container mt-2">
        <div class="form-group">
          <input type="date" class="form-control" id="date" />
        </div>
      </div>
      <div class="fields container mt-2">
        <div class="form-group">
          <input type="string" class="form-control" id="date" placeholder="Start to end" />
        </div>
      </div>
      <div class="fields container mt-2">
        <div class="form-group">
          <input type="string" class="form-control" id="Occupancy" placeholder="Occupancy" />
        </div>
      </div>

      <div id="equitment" className="equipment col-md-6">
        <p>Equipment</p>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="Whiteboard" />
          <label class="form-check-label" for="Whiteboard">
            Whiteboard
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="Projector" />
          <label class="form-check-label" for="Projector">
            Projector
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="Mics" />
          <label class="form-check-label" for="Mics">
            Mics/speakers
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="Power" />
          <label class="form-check-label" for="Power">
            Power Outlet
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="Seats" />
          <label class="form-check-label" for="Seats">
            Extra chair/seating
          </label>
        </div>
      </div>
    </div>
  );

}
