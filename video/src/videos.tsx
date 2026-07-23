import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const C = {
  paper: '#f0eee8',
  paperDeep: '#e7e0d4',
  navy: '#17344f',
  ink: '#202629',
  muted: '#68737a',
  rule: '#c8c2b7',
  red: '#bc493f',
  redPale: '#ecdcd9',
  green: '#4f7562',
  greenPale: '#dfe8df',
  blue: '#4f718a',
  gold: '#9a7436',
};

const serif = 'Georgia, "Times New Roman", serif';
const mono = '"SFMono-Regular", Menlo, Monaco, Consolas, monospace';

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const progress = (frame: number, start: number, end: number) =>
  clamp01(interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
const fadeScene = (frame: number, duration: number) =>
  interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const PaperTexture: React.FC = () => (
  <AbsoluteFill
    style={{
      background: C.paper,
      backgroundImage:
        'radial-gradient(circle at 18% 15%, rgba(255,255,255,.72), transparent 34%), radial-gradient(circle at 82% 82%, rgba(23,52,79,.05), transparent 42%)',
    }}
  />
);

const Brand: React.FC<{compact?: boolean}> = ({compact = false}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: compact ? 14 : 18}}>
    <Img src={staticFile('agentbait-mark.png')} style={{width: compact ? 34 : 44, height: compact ? 58 : 74, objectFit: 'contain'}} />
    <div style={{fontFamily: serif, color: C.navy, fontSize: compact ? 31 : 42, fontWeight: 700, letterSpacing: '-0.035em'}}>
      AgentBait
    </div>
  </div>
);

const IntroCard: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const reveal = spring({fps, frame, config: {damping: 18, stiffness: 110}});
  return (
    <AbsoluteFill style={{opacity: fadeScene(frame, durationInFrames), padding: portrait ? '130px 76px' : '90px 120px'}}>
      <PaperTexture />
      <div style={{position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Brand compact={portrait} />
        <div style={{maxWidth: portrait ? 900 : 1500, transform: `translateY(${(1 - reveal) * 46}px)`, opacity: reveal}}>
          <div style={{fontFamily: mono, color: C.red, fontSize: portrait ? 22 : 24, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: portrait ? 32 : 28}}>
            Fixed slate · one target rewrite
          </div>
          <h1 style={{margin: 0, color: C.navy, fontFamily: serif, fontSize: portrait ? 84 : 96, fontWeight: 500, lineHeight: 1.02, letterSpacing: '-.045em'}}>
            Can rewriting one candidate change what an AI agent selects?
          </h1>
        </div>
        <div style={{fontFamily: mono, color: C.muted, fontSize: portrait ? 19 : 20, letterSpacing: '.05em'}}>
          Content Rewriting for Agentic Choice
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ConstraintStrip: React.FC = () => (
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: `1px solid ${C.navy}`, borderBottom: `1px solid ${C.navy}`, background: 'rgba(240,238,232,.94)'}}>
    {['Candidate list fixed', 'Order fixed', 'Chooser prompt fixed', 'Target only rewritten'].map((item, index) => (
      <div key={item} style={{padding: '17px 22px', borderLeft: index ? `1px solid ${C.rule}` : 'none', color: index === 3 ? C.red : C.navy, fontFamily: mono, fontSize: 17, fontWeight: 700, letterSpacing: '.055em', textAlign: 'center', textTransform: 'uppercase'}}>
        {item}
      </div>
    ))}
  </div>
);

const MechanismPanelHeader: React.FC<{step: string; state: string; title: string; red?: boolean}> = ({step, state, title, red = false}) => (
  <header style={{minHeight: 108, paddingBottom: 18, borderBottom: `1px solid ${C.rule}`}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: mono, textTransform: 'uppercase'}}>
      <span style={{color: C.navy, fontSize: 14, fontWeight: 700, letterSpacing: '.09em'}}>{step}</span>
      <span style={{padding: '5px 8px', border: `1px solid ${red ? C.red : C.rule}`, color: red ? C.red : C.muted, background: red ? C.redPale : 'transparent', fontSize: 12, fontWeight: 700, letterSpacing: '.08em'}}>{state}</span>
    </div>
    <h2 style={{margin: '12px 0 0', color: C.navy, fontFamily: serif, fontSize: 39, lineHeight: 1, fontWeight: 600}}>{title}</h2>
  </header>
);

const MechanismScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const advisorSlate = progress(frame, 8, 54);
  const targetExtract = progress(frame, 48, 100);
  const note = progress(frame, 96, 140);
  const link = progress(frame, 130, 180);
  const strike = progress(frame, 168, 208);
  const typing = progress(frame, 196, 316);
  const candidateReplace = progress(frame, 300, 340);
  const scanA = progress(frame, 340, 366) * (1 - progress(frame, 369, 378));
  const scanB = progress(frame, 370, 396) * (1 - progress(frame, 399, 408));
  const scanC = progress(frame, 400, 423) * (1 - progress(frame, 425, 432));
  const chosen = progress(frame, 420, 448);
  const typedTitle = 'What Makes a Model Choose This?';
  const typedAbstract = 'A controlled rewrite reveals which presentation cues redirect the same chooser.';
  const titleCount = Math.floor(typing * typedTitle.length);
  const abstractCount = Math.floor(clamp01((typing - 0.42) / 0.58) * typedAbstract.length);

  return (
    <AbsoluteFill style={{opacity: fadeScene(frame, durationInFrames), padding: '54px 80px 48px'}}>
      <PaperTexture />
      <div style={{position: 'relative', zIndex: 2, height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 22}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Brand compact />
          <div style={{color: C.muted, fontFamily: mono, fontSize: 16, letterSpacing: '.08em', textTransform: 'uppercase'}}>Advisor → Rewriter → Target Agent</div>
        </div>

        <div style={{position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18}}>
          <div style={{position: 'absolute', left: '31.8%', top: 150, width: `${link * 20}%`, height: 2, zIndex: 20, background: `repeating-linear-gradient(90deg, ${C.red} 0 10px, transparent 10px 18px)`}}>
            <div style={{position: 'absolute', right: -8, top: -5, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `9px solid ${C.red}`}} />
          </div>

          <section style={{position: 'relative', overflow: 'hidden', minHeight: 710, padding: 22, border: `1px solid ${C.navy}`, borderTopWidth: 3, background: 'rgba(255,255,255,.18)'}}>
            <MechanismPanelHeader step="01 · Target input" state="Trained" title="Advisor" red />
            <div style={{position: 'relative', height: 548}}>
              <div style={{position: 'absolute', left: -60, bottom: -28, width: 360, height: 460, overflow: 'hidden', transform: 'scaleX(-1)', opacity: .92}}>
                <Img src={staticFile('advisor-scholar.png')} style={{position: 'absolute', width: 690, left: -270, top: -8, filter: 'saturate(.82) contrast(1.05)'}} />
              </div>
              <div style={{position: 'absolute', right: 4, bottom: 38, width: '57%', opacity: advisorSlate * (1 - targetExtract * .7), transform: `translate(${(1 - advisorSlate) * 180}px, ${(1 - advisorSlate) * 24}px)`, border: `1px solid ${C.navy}`, background: 'rgba(240,238,232,.97)', boxShadow: '6px 7px 0 rgba(23,52,79,.08)'}}>
                <div style={{padding: '9px 11px', color: C.muted, borderBottom: `1px solid ${C.rule}`, fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase'}}>Fixed candidate list</div>
                {['Candidate A', 'Target B', 'Candidate C'].map((label, index) => (
                  <div key={label} style={{padding: '12px', display: 'grid', gridTemplateColumns: '28px 1fr', borderBottom: index < 2 ? `1px solid ${C.rule}` : 'none', opacity: index === 1 ? 1 : 1 - targetExtract, color: index === 1 ? C.red : C.ink, fontFamily: serif, fontSize: 17}}>
                    <b style={{fontFamily: mono, fontSize: 13}}>{String.fromCharCode(65 + index)}</b><span>{label}</span>
                  </div>
                ))}
              </div>
              <div style={{position: 'absolute', right: 18, top: 155, width: '66%', padding: '16px 17px', opacity: targetExtract, transform: `translateY(${(1 - targetExtract) * 80}px) scale(${.72 + targetExtract * .28})`, border: `1px solid ${C.navy}`, background: C.paper, boxShadow: '7px 8px 0 rgba(23,52,79,.08)'}}>
                <small style={{color: C.red, fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase'}}>Advisor input · target only</small>
                <p style={{margin: '12px 0 4px', display: 'grid', gridTemplateColumns: '34px 1fr', gap: 10, alignItems: 'center', fontFamily: serif, fontSize: 20, fontWeight: 700}}><b style={{width: 34, height: 34, display: 'grid', placeItems: 'center', color: C.paper, background: C.navy, fontFamily: mono, fontSize: 13}}>B</b>Target document</p>
                <em style={{color: C.muted, fontFamily: mono, fontSize: 12, fontStyle: 'normal'}}>Title + abstract</em>
              </div>
              <div style={{position: 'absolute', right: 12, top: 30, width: '72%', padding: '15px 17px', opacity: note, transform: `translateY(${(1 - note) * -16}px) scale(${.94 + note * .06}) rotate(-.8deg)`, border: `1px solid ${C.rule}`, background: C.paper, boxShadow: '6px 7px 0 rgba(23,52,79,.06)'}}>
                <small style={{display: 'block', color: C.red, fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase'}}>Advisor suggests</small>
                <b style={{display: 'block', marginTop: 9, fontFamily: serif, fontSize: 18, fontStyle: 'italic', fontWeight: 500}}>“Try a sharper, more specific framing.”</b>
              </div>
            </div>
          </section>

          <section style={{position: 'relative', overflow: 'hidden', minHeight: 710, padding: 22, border: `1px solid ${C.navy}`, borderTop: `3px solid ${C.red}`, background: 'rgba(255,255,255,.18)'}}>
            <MechanismPanelHeader step="02 · Edit" state="Frozen" title="Frozen Rewriter" />
            <div style={{position: 'relative', height: 548}}>
              <div style={{position: 'absolute', left: 18, top: 74, width: '87%', minHeight: 358, padding: '27px 24px', background: C.paperDeep, border: '1px solid #bcb09e', boxShadow: '9px 10px 0 rgba(110,83,55,.09)', transform: 'rotate(-.7deg)'}}>
                <small style={{display: 'block', marginBottom: 12, color: C.muted, fontFamily: mono, fontSize: 12, letterSpacing: '.07em', textTransform: 'uppercase'}}>{typing > .15 ? 'Rewritten title' : 'Original title'}</small>
                <div style={{minHeight: 95, position: 'relative', fontFamily: serif, fontSize: 21, lineHeight: 1.35}}>
                  <p style={{margin: 0, opacity: 1 - typing, position: 'absolute'}}>A study of <span style={{position: 'relative'}}>news recommendation<span style={{position: 'absolute', left: 0, right: 0, top: '53%', height: 2, background: C.red, transformOrigin: 'right', transform: `scaleX(${strike})`}} /></span></p>
                  <p style={{margin: 0, color: C.red, fontFamily: mono, fontWeight: 700, opacity: typing > .03 ? 1 : 0}}>{typedTitle.slice(0, titleCount)}{typing < 1 && <span style={{opacity: frame % 18 < 9 ? 1 : 0}}>|</span>}</p>
                </div>
                <small style={{display: 'block', margin: '10px 0 12px', color: C.muted, fontFamily: mono, fontSize: 12, letterSpacing: '.07em', textTransform: 'uppercase'}}>{typing > .45 ? 'Rewritten abstract' : 'Original abstract'}</small>
                <div style={{minHeight: 142, position: 'relative', fontFamily: serif, fontSize: 17, lineHeight: 1.45}}>
                  <p style={{margin: 0, opacity: 1 - clamp01(typing * 1.7), position: 'absolute'}}>We study how language models choose among a fixed slate of news candidates.</p>
                  <p style={{margin: 0, color: C.red, fontFamily: mono, fontSize: 16, fontWeight: 700, opacity: abstractCount > 0 ? 1 : 0}}>{typedAbstract.slice(0, abstractCount)}{abstractCount > 0 && abstractCount < typedAbstract.length && <span style={{opacity: frame % 18 < 9 ? 1 : 0}}>|</span>}</p>
                </div>
              </div>
              <div style={{position: 'absolute', left: '38%', top: 8, width: 190, padding: '8px 10px', opacity: link, color: C.red, background: C.paper, border: `1px solid ${C.red}`, fontFamily: mono, textTransform: 'uppercase'}}><small style={{display: 'block', color: C.muted, fontSize: 11, letterSpacing: '.08em'}}>Control input</small><b style={{fontSize: 13, letterSpacing: '.06em'}}>Strategy</b></div>
              <div style={{position: 'absolute', left: '28%', top: 44, width: 360, height: 430, opacity: progress(frame, 158, 210) * (1 - progress(frame, 322, 348)), transform: `translateX(${Math.sin(frame / 9) * 12}px) rotate(${Math.sin(frame / 13) * 1.2}deg)`, transformOrigin: '45px 300px'}}>
                <Img src={staticFile('rewriter-hand-strings.png')} style={{width: 360, filter: 'saturate(.88) contrast(1.05)'}} />
              </div>
            </div>
          </section>

          <section style={{position: 'relative', overflow: 'hidden', minHeight: 710, padding: 22, border: `1px solid ${C.navy}`, borderTop: `3px solid ${C.gold}`, background: 'rgba(255,255,255,.18)'}}>
            <MechanismPanelHeader step="03 · Select" state="Frozen" title="Target Agent" />
            <div style={{position: 'relative', height: 548}}>
              <ol style={{width: '86%', margin: 0, padding: '116px 0 0', listStyle: 'none'}}>
                {[
                  ['A', 'Candidate A'],
                  ['B', candidateReplace > .5 ? 'What Makes a Model Choose This?' : 'Target B'],
                  ['C', 'Candidate C'],
                ].map(([id, label], index) => {
                  const scan = [scanA, scanB, scanC][index];
                  const selected = index === 1 && chosen > .55;
                  return (
                    <li key={id} style={{minHeight: 89, padding: '14px 15px', display: 'grid', gridTemplateColumns: '30px 1fr', gap: 10, alignItems: 'center', position: 'relative', color: C.ink, background: selected ? C.redPale : C.paper, border: `1px solid ${C.navy}`, borderBottom: index < 2 ? 0 : `1px solid ${C.navy}`, boxShadow: selected ? `inset 5px 0 0 ${C.red}` : 'none', transform: selected ? 'translateX(-4px)' : 'none'}}>
                      <b style={{color: C.muted, fontFamily: mono, fontSize: 13}}>{id}</b>
                      <span style={{fontFamily: serif, fontSize: 18, fontWeight: 700, lineHeight: 1.15}}>{label}</span>
                      <span style={{position: 'absolute', inset: 5, opacity: scan, border: `2px solid ${C.blue}`, boxShadow: '0 0 14px rgba(79,113,138,.28)'}} />
                      {index === 1 && <small style={{gridColumn: 2, color: selected ? C.red : candidateReplace > .5 ? C.red : C.muted, fontFamily: mono, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase'}}>{selected ? 'Rewritten · selected' : candidateReplace > .5 ? 'Rewritten target' : 'Original · unselected'}</small>}
                    </li>
                  );
                })}
              </ol>
              <div style={{position: 'absolute', left: '76%', top: 260, opacity: progress(frame, 352, 390) * (1 - progress(frame, 442, 449)), transform: `translateY(${(1 - chosen) * -60 + chosen * 28}px) rotate(90deg)`, transformOrigin: '5% 22%'}}>
                <Img src={staticFile('selector-hand.png')} style={{width: 360, filter: 'saturate(1.02) contrast(1.2) brightness(.88) drop-shadow(0 8px 10px rgba(23,52,79,.22))'}} />
              </div>
            </div>
          </section>
        </div>
        <ConstraintStrip />
      </div>
    </AbsoluteFill>
  );
};

const MainResultCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const reveal = spring({fps, frame, config: {damping: 16, stiffness: 90}});
  return (
    <AbsoluteFill style={{opacity: fadeScene(frame, durationInFrames), padding: '88px 120px'}}>
      <PaperTexture />
      <div style={{position: 'relative', zIndex: 2, height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr auto'}}>
        <Brand compact />
        <div style={{display: 'grid', placeItems: 'center'}}>
          <div style={{width: '100%', maxWidth: 1480, padding: '64px 70px', borderTop: `4px solid ${C.navy}`, borderBottom: `1px solid ${C.navy}`, background: 'rgba(255,255,255,.16)', transform: `scale(${.94 + reveal * .06})`, opacity: reveal}}>
            <div style={{fontFamily: mono, color: C.muted, fontSize: 22, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase'}}>Target selection</div>
            <div style={{marginTop: 34, display: 'grid', gridTemplateColumns: '1fr 120px 1fr', alignItems: 'center', textAlign: 'center'}}>
              <div><b style={{display: 'block', color: C.navy, fontFamily: mono, fontSize: 142, lineHeight: .9, letterSpacing: '-.07em'}}>17.1%</b><small style={{display: 'block', marginTop: 20, color: C.muted, fontFamily: mono, fontSize: 20, letterSpacing: '.08em', textTransform: 'uppercase'}}>Original target</small></div>
              <div style={{color: C.red, fontFamily: serif, fontSize: 72}}>→</div>
              <div><b style={{display: 'block', color: C.red, fontFamily: mono, fontSize: 142, lineHeight: .9, letterSpacing: '-.07em'}}>98.5%</b><small style={{display: 'block', marginTop: 20, color: C.red, fontFamily: mono, fontSize: 20, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase'}}>RL-trained advisor</small></div>
            </div>
          </div>
        </div>
        <div style={{color: C.muted, fontFamily: mono, fontSize: 18}}>Same candidate identities and order · one target rewritten</div>
      </div>
    </AbsoluteFill>
  );
};

const CaveatCard: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const reveal = spring({fps, frame, config: {damping: 18, stiffness: 96}});
  return (
    <AbsoluteFill style={{opacity: fadeScene(frame, durationInFrames), padding: portrait ? '124px 72px' : '88px 120px'}}>
      <PaperTexture />
      <div style={{position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <Brand compact={portrait} />
        <div style={{maxWidth: portrait ? 900 : 1540, paddingLeft: portrait ? 30 : 44, borderLeft: `${portrait ? 8 : 10}px solid ${C.red}`, transform: `translateX(${(1 - reveal) * 40}px)`, opacity: reveal}}>
          <div style={{fontFamily: mono, color: C.red, fontSize: portrait ? 21 : 23, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 28}}>Important limitation</div>
          <h2 style={{margin: 0, color: C.navy, fontFamily: serif, fontSize: portrait ? 76 : 92, fontWeight: 500, lineHeight: 1.05, letterSpacing: '-.04em'}}>
            Optimizing selection alone can produce unsupported rewrites.
          </h2>
        </div>
        <div style={{fontFamily: mono, color: C.muted, fontSize: portrait ? 18 : 19}}>Selection success and source support can diverge.</div>
      </div>
    </AbsoluteFill>
  );
};

const OutroCard: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const reveal = spring({fps, frame, config: {damping: 16, stiffness: 90}});
  return (
    <AbsoluteFill style={{opacity: fadeScene(frame, durationInFrames), padding: portrait ? '126px 74px' : '88px 120px'}}>
      <PaperTexture />
      <div style={{position: 'relative', zIndex: 2, height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center'}}>
        <div style={{transform: `scale(${.92 + reveal * .08})`, opacity: reveal}}>
          <div style={{display: 'flex', justifyContent: 'center'}}><Brand compact={portrait} /></div>
          <h2 style={{margin: portrait ? '66px 0 36px' : '52px 0 28px', color: C.navy, fontFamily: serif, fontSize: portrait ? 84 : 88, fontWeight: 500, letterSpacing: '-.04em'}}>You Won&apos;t Believe This Click</h2>
          <div style={{fontFamily: mono, color: C.navy, fontSize: portrait ? 28 : 31, fontWeight: 700, letterSpacing: '.08em', wordSpacing: portrait ? 8 : 14}}>Paper · Code · <span style={{color: C.muted}}>Models</span> · Demo</div>
          <div style={{width: portrait ? 600 : 760, height: 1, margin: portrait ? '56px auto 42px' : '42px auto 30px', background: C.rule}} />
          <div style={{color: C.red, fontFamily: mono, fontSize: portrait ? 39 : 44, fontWeight: 700, letterSpacing: '-.02em'}}>agentbait.github.io</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PortraitSlate: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const rewrite = progress(frame, 154, 270);
  const beforeSelected = progress(frame, 42, 88) * (1 - progress(frame, 112, 146));
  const scanA = progress(frame, 290, 315) * (1 - progress(frame, 319, 328));
  const scanB = progress(frame, 322, 347) * (1 - progress(frame, 351, 360));
  const scanC = progress(frame, 354, 379) * (1 - progress(frame, 383, 392));
  const afterSelected = progress(frame, 384, 414);
  const candidates = [
    ['A', rewrite > .5 ? 'When Marshawn Lynch Took the Pitch: An Inside Look …' : "Marshawn playing in charity soccer game went exactly as you'd expect."],
    ['B', "Sofia Vergara and Joe Manganiello Celebrate 4-Year Wedding Anniversary: 'Mi Amor!'"],
    ['C', "The Coolest And Craziest McDonald's Across The Country"],
  ];
  return (
    <AbsoluteFill style={{opacity: fadeScene(frame, durationInFrames), padding: '82px 62px'}}>
      <PaperTexture />
      <div style={{position: 'relative', zIndex: 2, height: '100%', display: 'grid', gridTemplateRows: 'auto auto 1fr auto', gap: 34}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><Brand compact /><span style={{color: C.muted, fontFamily: mono, fontSize: 18, letterSpacing: '.08em', textTransform: 'uppercase'}}>Same slate · target A</span></div>
        <div style={{padding: '24px 26px', borderTop: `2px solid ${C.navy}`, borderBottom: `1px solid ${C.navy}`, fontFamily: mono, fontSize: 18, fontWeight: 700, letterSpacing: '.07em', textAlign: 'center', textTransform: 'uppercase'}}>
          Candidate identities fixed · order fixed · target only rewritten
        </div>
        <div style={{display: 'grid', alignContent: 'center'}}>
          <div style={{padding: '24px 20px', border: `1px solid ${C.navy}`, borderTopWidth: 4, background: 'rgba(255,255,255,.16)'}}>
            <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 8px 22px', borderBottom: `1px solid ${C.rule}`}}><b style={{fontFamily: serif, color: C.navy, fontSize: 36}}>Candidate list</b><span style={{fontFamily: mono, color: rewrite > .5 ? C.red : C.muted, fontSize: 17, fontWeight: 700, textTransform: 'uppercase'}}>{rewrite > .5 ? 'Target rewritten' : 'Original presentation'}</span></header>
            <ol style={{margin: 0, padding: 0, listStyle: 'none'}}>
              {candidates.map(([id, title], index) => {
                const scanned = [scanA, scanB, scanC][index];
                const selected = (index === 1 && beforeSelected > .55) || (index === 0 && afterSelected > .55);
                return (
                  <li key={id} style={{minHeight: 220, padding: '27px 24px', display: 'grid', gridTemplateColumns: '54px 1fr', gap: 18, alignItems: 'center', position: 'relative', background: selected ? C.redPale : C.paper, borderBottom: index < 2 ? `1px solid ${C.rule}` : 'none', boxShadow: selected ? `inset 7px 0 0 ${C.red}` : 'none'}}>
                    <b style={{color: selected ? C.red : C.muted, fontFamily: mono, fontSize: 24}}>{id}.</b>
                    <div><strong style={{display: 'block', color: index === 0 && rewrite > .05 ? C.red : C.ink, fontFamily: serif, fontSize: 34, lineHeight: 1.16, fontWeight: 600}}>{title}</strong>{index === 0 && <small style={{display: 'block', marginTop: 14, color: selected ? C.red : C.muted, fontFamily: mono, fontSize: 16, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase'}}>{afterSelected > .55 ? 'Rewritten · selected' : rewrite > .5 ? 'Rewritten target' : 'Original · unselected'}</small>}</div>
                    <span style={{position: 'absolute', inset: 8, opacity: scanned, border: `3px solid ${C.blue}`, boxShadow: '0 0 18px rgba(79,113,138,.28)'}} />
                    {selected && <span style={{position: 'absolute', right: 22, bottom: 18, color: C.red, fontFamily: mono, fontSize: 16, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase'}}>Selected</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
        <div style={{minHeight: 82, display: 'grid', placeItems: 'center', opacity: Math.max(beforeSelected, afterSelected)}}>
          <div style={{display: 'grid', gridTemplateColumns: 'auto auto auto auto auto', gap: 18, alignItems: 'center', fontFamily: mono, fontSize: 23}}><span style={{color: C.muted}}>Before</span><b style={{color: C.navy}}>Click B</b><i style={{color: C.red, fontFamily: serif, fontSize: 34, fontStyle: 'normal'}}>→</i><span style={{color: C.muted}}>After</span><b style={{color: C.red}}>Click A</b></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PortraitResult: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const reveal = spring({fps, frame, config: {damping: 16, stiffness: 92}});
  return (
    <AbsoluteFill style={{opacity: fadeScene(frame, durationInFrames), padding: '120px 72px'}}>
      <PaperTexture />
      <div style={{position: 'relative', zIndex: 2, height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr auto'}}>
        <Brand compact />
        <div style={{display: 'grid', placeItems: 'center', textAlign: 'center', transform: `scale(${.92 + reveal * .08})`, opacity: reveal}}>
          <div>
            <div style={{color: C.muted, fontFamily: mono, fontSize: 24, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase'}}>Target selection</div>
            <div style={{marginTop: 62, color: C.navy, fontFamily: mono, fontSize: 126, fontWeight: 700, lineHeight: .9, letterSpacing: '-.07em'}}>17.1%</div>
            <div style={{margin: '42px 0', color: C.red, fontFamily: serif, fontSize: 82}}>↓</div>
            <div style={{color: C.red, fontFamily: mono, fontSize: 150, fontWeight: 700, lineHeight: .9, letterSpacing: '-.07em'}}>98.5%</div>
            <div style={{marginTop: 30, color: C.red, fontFamily: mono, fontSize: 23, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase'}}>RL-trained advisor</div>
          </div>
        </div>
        <div style={{color: C.muted, fontFamily: mono, fontSize: 18, lineHeight: 1.5}}>Same candidate list and chooser conditions.</div>
      </div>
    </AbsoluteFill>
  );
};

export const LandscapeVideo: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <Sequence from={0} durationInFrames={90}><IntroCard /></Sequence>
    <Sequence from={90} durationInFrames={450}><MechanismScene /></Sequence>
    <Sequence from={540} durationInFrames={210}><MainResultCard /></Sequence>
    <Sequence from={750} durationInFrames={180}><CaveatCard /></Sequence>
    <Sequence from={930} durationInFrames={120}><OutroCard /></Sequence>
  </AbsoluteFill>
);

export const PortraitVideo: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <Sequence from={0} durationInFrames={60}><IntroCard portrait /></Sequence>
    <Sequence from={60} durationInFrames={420}><PortraitSlate /></Sequence>
    <Sequence from={480} durationInFrames={120}><PortraitResult /></Sequence>
    <Sequence from={600} durationInFrames={60}><CaveatCard portrait /></Sequence>
    <Sequence from={660} durationInFrames={60}><OutroCard portrait /></Sequence>
  </AbsoluteFill>
);
