import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "开源平等",
    Svg: require("@site/static/img/Open_Source.svg").default,
    description: (
      <>
        I think that Open Source can do better, and I'm willing to put my money
        where my mouth is by working on Open Source, but it's not a crusade –
        it's just a superior way of working together and generating code.
        <br />
        -- Torvalds, Linus.
      </>
    ),
  },
  {
    title: "薪火相传",
    Svg: require("@site/static/img/Tux.svg").default,
    description: (
      <>
        新竹高于旧竹枝，全凭老干为扶持。 下年再有新生者，十丈龙孙绕凤池。
        <br />
        ——清·郑燮《竹石》
      </>
    ),
  },
  {
    title: "兼容并包",
    Svg: require("@site/static/img/beastie.svg").default,
    description: (
      <>
        My own computational world is a strange blend of Plan 9, Windows, and
        Inferno. I very much admire Linux's growth and vigor.
        <br />
        -- Dennis M. Ritchie.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
