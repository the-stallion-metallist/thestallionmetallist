import { ubc } from "@/lib/content";

export default function Ubc() {
  return (
    <section className="block" id="ubc" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="ubc reveal">
          <div className="ubc-grid">
            <div className="ubc-copy">
              <span className="eyebrow">{ubc.eyebrow}</span>
              <h2 className="metal">{ubc.heading}</h2>
              <p>{ubc.body}</p>
              <div className="ubc-badges">
                <span className="ubc-badge"><span className="live" /> {ubc.liveBadge}</span>
                <span className="ubc-badge soon">◷ {ubc.soonBadge}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.6rem 1.3rem" }}>
                <a className="btn btn-steel" href={ubc.cta.href} target="_blank" rel="noopener">
                  {ubc.cta.label} <span className="circ" style={{ background: "rgba(255,255,255,0.2)" }}>→</span>
                </a>
                <a
                  href="/aluminium-can-collection-dehradun"
                  style={{ color: "var(--copper)", fontWeight: 600, textDecoration: "none", fontSize: "0.95rem" }}
                >
                  Doorstep can collection in Dehradun →
                </a>
              </div>
            </div>

            <div className="ubc-app">
              <div className="phone">
                <div className="phone-screen">
                  <div className="phone-grain" />
                  <div className="phone-island" />
                  <div className="phone-gloss" />
                  <div className="ps-status">
                    <span>9:41</span>
                    <span className="ico">
                      <span className="sig"><i /><i /><i /><i /></span>
                      <span className="wifi" />
                      <span className="batt"><i /></span>
                    </span>
                  </div>
                  <div className="dash-top">
                    <div className="dash-hd">
                      <div className="u">
                        <span className="av" />
                        <div><small>Good evening</small><b>{ubc.demo.greetingName}</b></div>
                      </div>
                      <div className="bell">🔔</div>
                    </div>
                    <div className="mcard">
                      <div className="row1">
                        <div className="bm">
                          <img src="/brand/logo-mark.png" alt="" />
                          <b>THE STALLION<br /><span>METALLIST · MEMBER</span></b>
                        </div>
                        <div className="wallet" />
                      </div>
                      <div className="lbl">Total earned</div>
                      <div className="earned"><span>₹</span>0</div>
                      <div className="meta">
                        <div><small>Member</small><b>{ubc.demo.memberName}</b></div>
                        <div><small>Cans recycled</small><b>0</b></div>
                        <div><small>Since</small><b>{ubc.demo.memberSince}</b></div>
                      </div>
                    </div>
                  </div>
                  <div className="dash-sheet">
                    <div className="grab" />
                    <div className="sh"><b>Active pickup</b><a href="#">View all</a></div>
                    <div className="pcard">
                      <div className="r"><b>100 cans</b><span className="req">● Requested</span></div>
                      <div className="loc">1118 · Dehradun</div>
                      <div className="pbar"><i /></div>
                      <div className="psteps"><span className="on">Requested</span><span>Scheduled</span><span>Collected</span></div>
                      <div className="pmeta">
                        <div><small>Pickup date</small><b>To be scheduled</b></div>
                        <div style={{ textAlign: "right" }}><small>Est. payout</small><b>₹150</b></div>
                      </div>
                    </div>
                    <a className="dash-btn" href={ubc.cta.href} target="_blank" rel="noopener">+ Schedule a pickup</a>
                    <div className="dash-hint">Got more cans? Start another pickup.</div>
                    <div className="dstats">
                      <div><b>0</b><small>Cans recycled</small></div>
                      <div><b>0</b><small>Pickups</small></div>
                      <div><b>₹0</b><small>Earned</small></div>
                    </div>
                  </div>
                  <div className="dnav">
                    <a className="on" href="#">⌂ Home</a><a href="#">+</a><a href="#">◷</a><a href="#">☺</a>
                  </div>
                  <div className="home-ind" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
