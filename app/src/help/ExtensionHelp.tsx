import { css } from '@emotion/react'
import { CardId, legendReplaces, legends } from '@gamepark/naishi/material/CardId'
import { LocationType } from '@gamepark/naishi/material/LocationType'
import { MaterialType } from '@gamepark/naishi/material/MaterialType'
import { NaishiRules } from '@gamepark/naishi/NaishiRules'
import { LocationHelpProps, useRules } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import Ryokan4 from '../images/cards/ryokan-4.jpg'
import { cardImages } from '../material/cardImages'
import { HelpLink, HelpPage, P, Section } from './parts'

const travellers = [CardId.UmbrellaLady, CardId.OldMan, CardId.CherryLady, CardId.Girl, CardId.Porter, CardId.Samurai]

/** Opens the help of the Legends & Travellers extension: the help of the cards set aside at the setup */
export const extensionHelpMove = MaterialMoveBuilder.displayLocationHelp({ type: LocationType.SetAside })

/** Opens the help of the Ryokan, wherever it is */
export const useRyokanHelpMove = () => {
  const ryokan = useRules<NaishiRules>()?.material(MaterialType.Ryokan)
  return ryokan?.length ? MaterialMoveBuilder.displayMaterialHelp(MaterialType.Ryokan, ryokan.getItem(), ryokan.getIndex()) : MaterialMoveBuilder.displayMaterialHelp(MaterialType.Ryokan, {})
}

/** A card of the help that opens the help of that card */
const CardLink = ({ id, caption }: { id: CardId; caption?: boolean }) => {
  const { t } = useTranslation()
  return (
    <HelpLink move={MaterialMoveBuilder.displayMaterialHelp(MaterialType.Card, { id })} card>
      <figure css={figureCss}>
        <img src={cardImages[id]} css={caption ? bigCardCss : smallCardCss} alt={t(`help.name.${id}`)} />
        {caption && <figcaption>{t(`help.name.${id}`)}</figcaption>}
      </figure>
    </HelpLink>
  )
}

/** The Legends of the game: each base card set aside was replaced by the Legend of the same character */
const useLegendsInPlay = () => {
  const rules = useRules<NaishiRules>()
  const setAside = rules?.material(MaterialType.Card).location(LocationType.SetAside).sort((item) => item.location.x!).getItems<CardId>() ?? []
  return setAside.flatMap((item) => legends.filter((legend) => legendReplaces[legend] === item.id))
}

/** The help of the Legends & Travellers extension, on the cards set aside at the setup */
export const ExtensionHelp = (_props: LocationHelpProps) => {
  const legendsInPlay = useLegendsInPlay()
  const ryokanHelpMove = useRyokanHelpMove()
  return (
    <HelpPage title="help.extension.name">
      <P k="help.extension.intro" />
      <Section title="help.extension.setup">
        <P k="help.extension.setup.legends" />
        <P k="help.extension.setup.travellers" />
        <P k="help.extension.setup.river" />
      </Section>
      <Section title="help.extension.legends">
        <P k="help.extension.legends.rule" />
        <div css={rowCss}>
          {legendsInPlay.map((id) => (
            <CardLink key={id} id={id} caption />
          ))}
        </div>
        <P k="help.extension.legends.ninja" />
      </Section>
      <Section title="help.extension.travellers">
        <P k="help.extension.travellers.rule" />
        <div css={rowCss}>
          {travellers.map((id) => (
            <CardLink key={id} id={id} />
          ))}
        </div>
        <P k="help.extension.travellers.enter" />
        <P k="help.extension.travellers.leave" />
        <P k="help.extension.travellers.options" />
      </Section>
      <Section title="help.ryokan.name">
        <div css={ryokanRowCss}>
          <HelpLink move={ryokanHelpMove} card>
            <img src={Ryokan4} css={smallCardCss} alt="" />
          </HelpLink>
          <div>
            <P k="help.extension.ryokan" components={{ ryokan: <HelpLink move={ryokanHelpMove} /> }} />
          </div>
        </div>
      </Section>
    </HelpPage>
  )
}

const rowCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.6em;
  margin: 0.6em 0;
`

const ryokanRowCss = css`
  display: flex;
  align-items: center;
  gap: 1em;
`

const figureCss = css`
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3em;

  figcaption {
    font-size: 0.8em;
    text-align: center;
    max-width: 6em;
  }
`

const bigCardCss = css`
  width: 6em;
  height: 8.38em;
  border-radius: 0.3em;
  box-shadow: 0 0.05em 0.2em rgba(0, 0, 0, 0.5);
`

const smallCardCss = css`
  width: 3.6em;
  height: 5.03em;
  border-radius: 0.2em;
  box-shadow: 0 0.05em 0.2em rgba(0, 0, 0, 0.5);
`
