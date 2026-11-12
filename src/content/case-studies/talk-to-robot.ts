// Every number here comes from the paper in public/llm-spatial-grounding-paper.pdf
// (table or section noted in the pull request). Headline figures are Table 1,
// baseline evaluation, few-shot. T3 is scored at 8 cm, not 5 cm; the near-zero
// T3 figure in Table 3 is the 5 cm artefact the paper calls misleading and is
// not quoted. Roles come from YangLin14/Talk-to-Robot commit authors as of
// 2026-11-11: the repository has no pull requests and the paper has no
// contribution statement. Aditya's paper sections (3, environment and
// controller; 4.1, the tiers) are his account of 2026-11-12, not in git.
import type { CaseStudy } from '../case-study'

const study: CaseStudy = {
  slug: 'talk-to-robot',
  title: 'Talk-to-Robot: LLM Spatial Grounding Study',
  description:
    'A UC San Diego CSE 190 study of where an LLM breaks when it turns robot commands into goals. End-to-end success falls from 98.3% to 50% over five tiers.',
  facts: {
    result: 'End-to-end success falls from 98.3% to 50% across five tiers',
    role: 'Co-author; two paper sections, T4 annotations, README',
    team: '5 people',
  },
  dateCreated: '2026-04',
  keywords: [
    'Talk-to-Robot',
    'LLM spatial grounding',
    'language-conditioned robotics',
    'instruction tiers',
    'FetchPush-v4',
    'MuJoCo',
    'SAC',
    'hindsight experience replay',
    'goal-conditioned reinforcement learning',
    'Gemini 3.1 Flash-Lite',
    'chain-of-thought prompting',
    'UC San Diego CSE 190',
  ],
  ogImage: {
    src: '/og/talk-to-robot.png',
    alt: 'Dark card with an AJ monogram, the title "Talk-to-Robot." and the line "End-to-end success falls from 98.3% to 50% across five tiers". Below it: Aditya Jadhav and adityajadhav.dev.',
  },
  sections: [
    {
      heading: 'The problem',
      body: [
        {
          p: 'People give a robot directions the way they give a person directions: put it next to the marker, get it out of the way. A goal-conditioned controller needs an x, y, z target. A language model can translate, but when the block lands in the wrong place, you cannot tell whether the model picked the wrong target or the controller missed a good one.',
        },
        {
          p: 'Talk-to-Robot was our CSE 190 (Deep Reinforcement Learning) project at UC San Diego in spring 2026. We kept the two stages apart and asked where the grounding breaks and which errors a controller can recover from.',
        },
      ],
    },
    {
      heading: 'What I built',
      body: [
        {
          p: 'All five of us are authors of the paper: Joseph Warzybok Mckenney, Fong-Yu (Yang) Lin, Waleed Alghaithi, Nasser Al Nasser and me. The paper has no contribution statement and the repository has no pull requests, so commits are the only record of who built what. The paper does not record who wrote which section either; by my own account, I wrote the sections on the environment and controller and on the five instruction tiers. In the repository, my commits are:',
        },
        {
          ul: [
            'One of the three sets of targets for the 20 functional-intent instructions. Joseph, Waleed and I each picked a target for every instruction, and the ground truth is the average of our three picks.',
            'The final README: tiers, key results, failure modes, setup and reproduction steps.',
            'The installable package layout: the code under src/talk_to_robot with a pyproject.toml.',
          ],
        },
        {
          p: "The rest is my teammates' work, by commit. Yang set up the repository and the environment guide, trained the SAC+HER policy, first ran the whole pipeline and added rollout video recording. Nasser wrote the regex baseline and the Gemini grounding package: client, prompts, output parser and failure classifier. Joseph built the evaluation harness and the instruction set, ran the T0 to T3 results and wrote the retraining. Waleed fixed the regex T0 parsing and the T2 cube position in the harness, ran the zero-shot T4 evaluation and reorganized the results.",
        },
      ],
    },
    {
      heading: 'How it works',
      body: [
        {
          p: 'A grounder reads the instruction and returns a target point on the table. A SAC+HER policy, trained once on the MuJoCo FetchPush-v4 task and then frozen, pushes the block there. Because the controller never changes, differences in end-to-end success come from the grounding.',
        },
        {
          p: 'We wrote 100 instructions, 20 in each of five tiers: literal coordinates (T0), named regions such as the upper-left corner (T1), relative offsets such as "push it 5 cm to the right" (T2), reference objects such as "next to the marker" (T3), and functional intent such as "get it out of the way" (T4). The grounder is gemini-3.1-flash-lite at temperature 0, prompted zero-shot, few-shot with three examples, or with chain-of-thought. A regex baseline covers T0 to T2.',
        },
        {
          p: "Each instruction gets three rollouts, so each tier's policy and end-to-end numbers rest on 60 episodes. We score whether the grounder's point is near the true target, whether the policy reaches the point it was given, and whether the block ends at the true target. The tolerance is 5 cm for T0 to T2, 8 cm for T3, and for T4 the annotators' average spread plus 3 cm.",
        },
        {
          p: 'A second experiment retrained the policy with 20% of goals near the workspace edge and 10% near its corners, a reward for getting close, and replays of the T2 and T3 failures.',
        },
      ],
    },
    {
      heading: 'Results',
      body: [
        {
          p: 'Few-shot numbers from Table 1 of the paper, as drawn in the chart above. The regex baseline does not handle T3 or T4.',
        },
        {
          table: {
            caption: 'Success by instruction tier, few-shot prompting (paper, Table 1)',
            head: ['Tier', 'Tolerance', 'Grounder success', 'Policy success', 'End-to-end success', 'Regex end-to-end'],
            rows: [
              ['T0 Literal coordinates', '5 cm', '100.0%', '100.0%', '98.3%', '98.3%'],
              ['T1 Named regions', '5 cm', '100.0%', '96.7%', '93.3%', '93.3%'],
              ['T2 Relative offsets', '5 cm', '45.0%', '95.0%', '76.7%', '85.0%'],
              ['T3 Reference objects', '8 cm', '100.0%', '96.7%', '73.3%', 'Not supported'],
              ['T4 Functional intent', 'Annotator spread', '50.0%', '93.3%', '50.0%', 'Not supported'],
            ],
          },
        },
        {
          p: 'Policy success stayed between 93.3% and 100% while end-to-end success fell, so the controller was not what failed. From T2 on, each tier failed differently:',
        },
        {
          ul: [
            'T2: a plain regex beat the model, 85.0% to 76.7% end to end. The model put goals just past the workspace edge or used the wrong sign. Chain-of-thought stopped the edge cases but flipped signs, and scored lowest, 60.0%.',
            'T3, scored at 8 cm: the model always picked the right object, then put the goal 0.060 m from it, the same offset on every case. At 5 cm every T3 case would fail.',
            "T4: the model tended to send the block to a corner. Its mean distance from the annotators' target, 0.186 to 0.195 m, is about how far apart the annotators were, around 0.20 m.",
          ],
        },
        {
          p: "Retraining brought policy success to 100% on every tier and, with chain-of-thought, cut the T3 block-to-goal distance from 38.7 mm to 23.4 mm. It did nothing for T2's off-table goals, and the 6 cm bias still kept T3 outside a 5 cm window.",
        },
      ],
    },
    {
      heading: 'What it gets wrong',
      body: [
        {
          ul: [
            'Twenty instructions per tier is a small sample. The paper treats any gap under about 10 percentage points as suggestive only.',
            "T3's score depends on the tolerance: 73.3% end to end at 8 cm, while at 5 cm the 6 cm offset alone fails every grounding. The retraining table uses 5 cm for T3, which the paper calls misleading, so this page does not quote it.",
            "T2's true target moves with the block's random start, so its changes after retraining are noise.",
            "We scored T4 against three annotators' average, so a reasonable corner can count as a miss. The paper says T4 needs rework.",
            'Everything ran in one simulated environment. The paper makes no sim-to-real claim.',
          ],
        },
      ],
    },
    {
      heading: 'Stack',
      body: [
        {
          ul: [
            'Python 3.11',
            'Gemini gemini-3.1-flash-lite as the grounder',
            'MuJoCo FetchPush-v4 through Gymnasium Robotics',
            'Stable-Baselines3 SAC with hindsight experience replay',
          ],
        },
      ],
    },
  ],
}

export default study
