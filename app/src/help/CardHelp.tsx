import { css } from '@emotion/react'
import { CardId } from '@gamepark/naishi/material/CardId'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialHelpProps, usePlayerId, useRules } from '@gamepark/react-game'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import BlackEmissary from '../images/tokens/black.png'
import WhiteEmissary from '../images/tokens/white.png'
import Ryokan4 from '../images/cards/ryokan-4.jpg'
import Ryokan7 from '../images/cards/ryokan-7.jpg'
import { cardBackImage } from '../material/cardImages'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { AdjacentCross, Arrow, Cell, CardRow, CountTable, FrameLegend, HelpPage, LShape, MiniCard, P, Section, TerritoryGrid, fullRow, rowOf, times } from './parts'

const c = (id: CardId, label?: string | number): Cell => ({ id, label })
const characters = [CardId.Naishi, CardId.Advisor, CardId.Sentinel, CardId.Monk, CardId.Horseman, CardId.Ronin]
const buildings = [CardId.Fortress, CardId.Torii, CardId.Rice, CardId.Banner]

/** A neighbour of a card: left, right, and in front of or behind it */
const around = (center: Cell, neighbour: Cell) => <AdjacentCross center={center} left={neighbour} right={neighbour} vertical={neighbour} />

const Captioned = ({ caption, children }: { caption: string; children: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <div css={captionedCss}>
      {children}
      <small>{t(caption)}</small>
    </div>
  )
}

/** Where the effect of a Traveller is triggered: when it comes from the River into the territory, or when it leaves it for the discard pile */
const Trigger = ({ id, kind }: { id: CardId; kind: 'enter' | 'leave' }) =>
  kind === 'enter' ? (
    <div css={flowCss}>
      <Captioned caption="help.where.river.name">
        <MiniCard id={id} />
      </Captioned>
      <Arrow />
      <Captioned caption="help.flow.territory">
        <MiniCard id={id} />
      </Captioned>
    </div>
  ) : (
    <div css={flowCss}>
      <Captioned caption="help.flow.territory">
        <MiniCard id={id} />
      </Captioned>
      <Arrow />
      <Captioned caption="help.where.discard.name">
        <MiniCard id={id} dim />
      </Captioned>
    </div>
  )

const SwapEffect = () => (
  <div css={flowCss}>
    <Captioned caption="help.flow.territory">
      <CardRow cells={[{ label: 'A' }, { label: 'B' }]} />
    </Captioned>
    <Arrow>⇄</Arrow>
    <Captioned caption="help.flow.territory">
      <CardRow cells={[{ label: 'B' }, { label: 'A' }]} />
    </Captioned>
  </div>
)

const RecallEffect = () => {
  const player = usePlayerId<number>()
  const token = player === 2 ? WhiteEmissary : BlackEmissary
  return (
    <div css={flowCss}>
      <Captioned caption="help.flow.court">
        <img src={token} css={tokenCss} alt="" />
      </Captioned>
      <Arrow />
      <Captioned caption="help.flow.reserve">
        <img src={token} css={tokenCss} alt="" />
      </Captioned>
    </div>
  )
}

const DevelopEffect = () => (
  <div css={flowCss}>
    <Captioned caption="help.where.river.name">
      <MiniCard label="?" />
    </Captioned>
    <Arrow />
    <Captioned caption="help.flow.territory">
      <MiniCard />
    </Captioned>
  </div>
)

const RyokanEffect = () => (
  <div css={flowCss}>
    <Captioned caption="help.ryokan.face4">
      <img src={Ryokan4} css={ryokanCss} alt="" />
    </Captioned>
    <Arrow />
    <Captioned caption="help.ryokan.face7">
      <img src={Ryokan7} css={ryokanCss} alt="" />
    </Captioned>
  </div>
)

const TravellerRule = ({ id, kind, effect }: { id: CardId; kind: 'enter' | 'leave'; effect: ReactNode }) => (
  <>
    <Section title="help.traveller.trigger">
      <P k={kind === 'enter' ? 'help.traveller.enter' : 'help.traveller.leave'} />
      <Trigger id={id} kind={kind} />
    </Section>
    <Section title="help.traveller.effect">
      <P k={`help.${id}.effect`} />
      {effect}
      <P k="help.traveller.reminder" />
    </Section>
  </>
)

/** With the Legendary Monk in the game, he counts as a Torii: 2 Torii and him make the 30 points of 3 Torii */
const ToriiHelp = () => {
  const rules = useRules<NaishiRules>()
  const legendaryMonk = rules?.material(MaterialType.Card).id(CardId.LegendMonk).length ? true : false
  return (
    <Section title="help.points">
      <P k="help.6.rule" />
      <CountTable
        rows={[
          { label: 'help.count.exact', values: { n: 1 }, cards: [c(CardId.Torii)], points: -5 },
          { label: 'help.count.exact', values: { n: 2 }, cards: times(2, c(CardId.Torii)), points: 0 },
          {
            label: 'help.count.atLeast',
            values: { n: 3 },
            cards: times(3, c(CardId.Torii)),
            alt: legendaryMonk ? [c(CardId.Torii), c(CardId.Torii), c(CardId.LegendMonk)] : undefined,
            points: 30
          }
        ]}
      />
    </Section>
  )
}

/** What the card does, by card */
const cardContent: Record<CardId, () => ReactNode> = {
  [CardId.Mountain]: () => (
    <Section title="help.points">
      <P k="help.1.rule" />
      <CountTable
        rows={[
          { label: 'help.count.exact', values: { n: 1 }, cards: [c(CardId.Mountain)], points: 5 },
          { label: 'help.count.atLeast', values: { n: 2 }, cards: times(2, c(CardId.Mountain)), more: true, points: -5 }
        ]}
      />
    </Section>
  ),
  [CardId.Naishi]: () => (
    <Section title="help.points">
      <P k="help.2.rule" />
      <TerritoryGrid line={rowOf(CardId.Naishi, { 2: 12 })} hand={rowOf(CardId.Naishi, { 2: 8 })} />
    </Section>
  ),
  [CardId.Advisor]: () => (
    <>
      <Section title="help.points.position">
        <P k="help.3.rule" />
        <TerritoryGrid line={fullRow(c(CardId.Advisor), [2, 4, 3, 4, 2])} hand={fullRow(c(CardId.Advisor), [2, 4, 3, 4, 2])} />
      </Section>
      <Section title="help.points.bonus">
        <P k="help.3.bonus" />
        {around(c(CardId.Advisor), c(CardId.Naishi, '+4'))}
      </Section>
    </>
  ),
  [CardId.Fortress]: () => (
    <Section title="help.points">
      <P k="help.4.rule" />
      <TerritoryGrid line={rowOf(CardId.Fortress, { 0: 6, 4: 6 })} hand={rowOf(CardId.Fortress, { 0: 6, 4: 6 })} />
    </Section>
  ),
  [CardId.Sentinel]: () => (
    <>
      <Section title="help.points">
        <P k="help.5.alone" />
        <AdjacentCross
          center={c(CardId.Sentinel, '+3')}
          left={{ id: CardId.Sentinel, dim: true, crossed: true }}
          right={{ id: CardId.Sentinel, dim: true, crossed: true }}
          vertical={{ id: CardId.Sentinel, dim: true, crossed: true }}
        />
      </Section>
      <Section title="help.points.bonus">
        <P k="help.5.bonus" />
        {around(c(CardId.Sentinel), c(CardId.Fortress, '+4'))}
      </Section>
    </>
  ),
  [CardId.Torii]: () => <ToriiHelp />,
  [CardId.Monk]: () => (
    <>
      <Section title="help.points.position">
        <P k="help.7.rule" />
        <TerritoryGrid hand={fullRow(c(CardId.Monk, 5))} />
      </Section>
      <Section title="help.points.bonus">
        <P k="help.7.bonus" />
        {around(c(CardId.Monk), c(CardId.Torii, '+2'))}
      </Section>
    </>
  ),
  [CardId.Rice]: () => (
    <Section title="help.points">
      <P k="help.8.rule" />
      <CountTable
        rows={[
          { label: 'help.rice.group', values: { n: 2 }, cards: times(2, c(CardId.Rice)), points: 10 },
          { label: 'help.rice.group', values: { n: 3 }, cards: times(3, c(CardId.Rice)), points: 20 },
          { label: 'help.rice.groupAtLeast', values: { n: 4 }, cards: [], shape: <LShape id={CardId.Rice} />, points: 30 }
        ]}
      />
      <P k="help.8.groups" />
    </Section>
  ),
  [CardId.Banner]: () => (
    <Section title="help.points">
      <P k="help.9.rule" />
      <TerritoryGrid line={fullRow(c(CardId.Banner))} />
      <CountTable
        rows={[
          { label: 'help.count.exact', values: { n: 1 }, cards: [c(CardId.Banner)], points: 3 },
          { label: 'help.count.exact', values: { n: 2 }, cards: times(2, c(CardId.Banner)), points: 8 }
        ]}
      />
    </Section>
  ),
  [CardId.Horseman]: () => (
    <>
      <Section title="help.points.position">
        <P k="help.10.rule" />
        <TerritoryGrid hand={fullRow(c(CardId.Horseman, 3))} />
      </Section>
      <Section title="help.points.bonus">
        <P k="help.10.bonus" />
        <TerritoryGrid line={[undefined, undefined, c(CardId.Banner)]} hand={rowOf(CardId.Horseman, { 2: '+10' })} />
      </Section>
    </>
  ),
  [CardId.Ronin]: () => (
    <Section title="help.points">
      <P k="help.11.rule" />
      <FrameLegend />
      <CardRow cells={characters.map((id) => c(id))} />
      <div css={spaceCss} />
      <CardRow cells={buildings.map((id) => c(id))} />
      <div css={spaceCss} />
      <CardRow cells={[CardId.Mountain, CardId.Ninja].map((id) => ({ id, crossed: true }))} />
      <P k="help.11.except" />
      <CountTable
        rows={[
          { label: 'help.ronin.types', values: { n: 8 }, cards: [], points: 8 },
          { label: 'help.ronin.types', values: { n: 9 }, cards: [], points: 15 },
          { label: 'help.ronin.types', values: { n: 10 }, cards: [], points: 45 }
        ]}
      />
    </Section>
  ),
  [CardId.Ninja]: () => (
    <Section title="help.points">
      <P k="help.12.rule" />
      <FrameLegend />
      <div css={flowCss}>
        <MiniCard id={CardId.Ninja} />
        <Arrow />
        <CardRow cells={characters.map((id) => c(id))} />
      </div>
      <P k="help.12.limits" />
    </Section>
  ),
  [CardId.LegendNaishi]: () => (
    <Section title="help.points">
      <P k="help.13.rule" />
      <TerritoryGrid line={rowOf(CardId.LegendNaishi, { 0: 10, 2: 10, 4: 10 })} hand={rowOf(CardId.LegendNaishi, { 2: 10 })} />
    </Section>
  ),
  [CardId.LegendAdvisor]: () => (
    <Section title="help.points">
      <P k="help.14.rule" />
      <CountTable
        rows={[
          { label: 'help.14.without', cards: [c(CardId.LegendAdvisor), c(CardId.Advisor), c(CardId.Advisor)], points: 15 },
          { label: 'help.14.with', cards: [c(CardId.Naishi), c(CardId.LegendAdvisor)], points: 0 }
        ]}
      />
    </Section>
  ),
  [CardId.LegendSentinel]: () => (
    <>
      <Section title="help.points">
        <P k="help.15.alone" />
        <AdjacentCross
          center={c(CardId.LegendSentinel, '+5')}
          left={{ id: CardId.Sentinel, dim: true, crossed: true }}
          right={{ id: CardId.Sentinel, dim: true, crossed: true }}
          vertical={{ id: CardId.Sentinel, dim: true, crossed: true }}
        />
      </Section>
      <Section title="help.points.bonus">
        <P k="help.15.bonus" />
        <TerritoryGrid
          line={[c(CardId.Fortress, '+3'), c(CardId.LegendSentinel), c(CardId.Rice, '+3'), undefined, c(CardId.Fortress, '+3')]}
        />
      </Section>
    </>
  ),
  [CardId.LegendMonk]: () => (
    <>
      <Section title="help.points">
        <P k="help.17.rule" />
        <FrameLegend />
        <AdjacentCross
          center={c(CardId.LegendMonk)}
          left={{ frame: 'character', label: '+2' }}
          right={{ frame: 'character', label: '+2' }}
          vertical={{ frame: 'character', label: '+2' }}
        />
      </Section>
      <Section title="help.17.icons.title">
        <P k="help.17.icons" />
        <div css={flowCss}>
          <MiniCard id={CardId.LegendMonk} />
          <Arrow>=</Arrow>
          <CardRow cells={[c(CardId.Monk), c(CardId.Torii)]} />
        </div>
      </Section>
    </>
  ),
  [CardId.LegendHorseman]: () => (
    <Section title="help.points">
      <P k="help.16.rule" />
      <FrameLegend />
      <AdjacentCross center={c(CardId.LegendHorseman)} left={{ id: CardId.Banner, label: '4+4' }} right={{ frame: 'building', label: '+4' }} vertical={{ frame: 'building', label: '+4' }} />
    </Section>
  ),
  [CardId.LegendRonin]: () => (
    <Section title="help.points">
      <P k="help.18.rule" />
      <FrameLegend />
      <CountTable
        rows={[
          { label: 'help.18.identical', values: { n: 3 }, cards: times(3, c(CardId.Rice)), points: 8 },
          { label: 'help.18.identical', values: { n: 4 }, cards: times(4, c(CardId.Rice)), points: 15 },
          { label: 'help.18.identical', values: { n: 5 }, cards: times(5, c(CardId.Rice)), points: 25 }
        ]}
      />
    </Section>
  ),
  [CardId.LegendNinja]: () => (
    <Section title="help.points">
      <P k="help.19.rule" />
      <FrameLegend />
      <div css={flowCss}>
        <MiniCard id={CardId.LegendNinja} />
        <Arrow />
        <Captioned caption="help.19.opponent">
          <CardRow cells={characters.map((id) => c(id))} />
        </Captioned>
      </div>
      <P k="help.19.limits" />
    </Section>
  ),
  [CardId.UmbrellaLady]: () => <TravellerRule id={CardId.UmbrellaLady} kind="leave" effect={<SwapEffect />} />,
  [CardId.OldMan]: () => <TravellerRule id={CardId.OldMan} kind="leave" effect={<RecallEffect />} />,
  [CardId.CherryLady]: () => <TravellerRule id={CardId.CherryLady} kind="enter" effect={<SwapEffect />} />,
  [CardId.Girl]: () => <TravellerRule id={CardId.Girl} kind="leave" effect={<DevelopEffect />} />,
  [CardId.Porter]: () => <TravellerRule id={CardId.Porter} kind="enter" effect={<RecallEffect />} />,
  [CardId.Samurai]: () => <TravellerRule id={CardId.Samurai} kind="enter" effect={<RyokanEffect />} />
}

/** A reminder of the place the card is in */
const PlaceNote = ({ type }: { type?: LocationType }) => {
  switch (type) {
    case LocationType.River:
      return (
        <Section title="help.where.river.name">
          <P k="help.where.river" />
        </Section>
      )
    case LocationType.Discard:
      return (
        <Section title="help.where.discard.name">
          <P k="help.where.discard" />
        </Section>
      )
    case LocationType.Line:
    case LocationType.Hand:
    case LocationType.FinalHand:
      return (
        <Section title="help.where.territory.name">
          <P k="help.where.territory" />
        </Section>
      )
    default:
      return null
  }
}

/** The help of a card: what it scores (or does), then where it is. A card nobody can see is explained by its place. */
export const CardHelp = ({ item }: MaterialHelpProps) => {
  const id = item.id as CardId | undefined
  if (id === undefined) {
    const type = item.location?.type
    const key = type === LocationType.RiverDeck ? 'pile' : type === LocationType.Gift ? 'gift' : 'hidden'
    return (
      <HelpPage title={`help.hidden.${key}.name`}>
        <P k={`help.hidden.${key}`} />
        {type === LocationType.RiverDeck && (
          <div css={flowCss}>
            <img src={cardBackImage} css={backCss} alt="" />
          </div>
        )}
      </HelpPage>
    )
  }
  const content = cardContent[id]
  return (
    <HelpPage title={`help.name.${id}`}>
      {content?.()}
      <PlaceNote type={item.location?.type} />
    </HelpPage>
  )
}

const flowCss = css`
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin: 0.6em 0 1em;
`

const captionedCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35em;

  small {
    font-size: 0.7em;
    color: #666;
    text-align: center;
    max-width: 8em;
  }
`

const tokenCss = css`
  width: 2.6em;
  height: 2.6em;
`

const ryokanCss = css`
  width: 2.6em;
  height: 3.63em;
  border-radius: 0.2em;
  box-shadow: 0 0.05em 0.2em rgba(0, 0, 0, 0.5);
`

const backCss = css`
  width: 2.6em;
  height: 3.63em;
  border-radius: 0.2em;
  box-shadow: 0.1em -0.1em 0 #ddd, 0.2em -0.2em 0 #ccc;
`

const spaceCss = css`
  height: 0.5em;
`
