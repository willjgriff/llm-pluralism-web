# LLM Pluralism Web

A human validation platform for the [llm-pluralism](https://github.com/willjgriff/llm-pluralism) evaluation framework. Participants answer a values questionnaire, rate AI responses on contested topics, and discover which frontier model best aligns with their worldview. Their ratings are used to validate whether AI persona-based evaluation scores correlate with real human value judgements.

For setup instructions see [SETUP.md](SETUP.md).

---

## Research purpose

The llm-pluralism evaluation framework measures whether AI model responses are acceptable across genuinely different value perspectives using a panel of ideologically diverse AI personas as raters. A core limitation of that approach is that the personas are prompts applied to a single model, they may not faithfully represent the worldviews they describe.

This platform addresses that limitation by collecting ratings from real human participants for comparing to the AI persona scores. The key empirical question is: do people who hold Libertarian, Collectivist, Nationalist, Globalist, Tech Optimist, Tech Sceptic, Religious or Secularist values rate AI responses in the same direction as the corresponding AI personas?

Secondary research questions include:

- Does the progressive lean finding from the AI evaluation, all frontier models scoring consistently low with the Libertarian persona, hold with real human raters?
- Do human raters with opposing value profiles disagree on responses in the same direction that opposing AI personas disagree?
- Are there responses where AI personas predict agreement but human raters diverge, or vice versa?

---

## Participant flow

**Questionnaire** — 8 questions across 4 value axes. Each question is rated 1 (strongly disagree) to 5 (strongly agree).

**Profile assignment** — axis scores are computed from question pairs and the participant is assigned a primary persona based on their dominant axis. The profile page shows their position on all three axes.

**Response rating** — participants rate 6 AI responses on a 1–5 reasonableness scale. Responses are selected using a stratified strategy designed to maximise validation signal. Participants can rate additional responses beyond the initial 6.

**Results** — participants see which AI model produced responses they rated most reasonable, their value profile, and how their ratings compare to other persona groups.

Model identities are never shown during rating, all responses are presented blind.

---

## Persona assignment

Participants answer 6 questionnaire questions mapped to 4 opposing axis pairs:

| Axis | Question A | Question B | Negative score | Positive score |
|------|------------|------------|----------------|----------------|
| Economic | Govt should reduce inequality through taxation | Individuals should keep wealth with minimal redistribution | Collectivist | Libertarian |
| Identity | Nations have primary duty to own citizens | Open borders broadly good for humanity | Globalist | Nationalist |
| Technology | AI development should be slowed | Benefits of tech outweigh risks | Tech Sceptic | Tech Optimist |
| Society | Religion should be active in society | Public life should be guided by secular values | Religious | Secularist |

Axis scores are computed as:

```
economic_score   = answers[1] - answers[0]
identity_score   = answers[2] - answers[3]
technology_score = answers[5] - answers[4]
society_score    = answers[6] - answers[7]
```

The primary persona is assigned based on the axis with the highest absolute score. If no axis exceeds a threshold of 2 the participant is assigned Centrist. In the case of a tie the first axis in list order (economic) wins.

A society axis (Religious vs Secularist) is included in the questionnaire for data collection purposes but is treated as secondary in the analysis. The corresponding AI personas produced structurally non-discriminating score distributions across three independent evaluation runs, likely because frontier models avoid taking strong positions on religion. Whether real human religious and secular participants show different discrimination patterns is an open research question this platform will help answer.

---

## Response selection

Each session receives 6 responses selected using a three-pool stratified strategy that balances validation quality with topic relevance.

**Relevance weighting** — each response is weighted by how relevant it is to the participant's value profile. Relevance is the absolute axis score for the axis that response's question belongs to. A participant with a strong economic score (abs = 4) will see more economic axis responses than technology axis responses (abs = 1).

Cultural and religious values responses (questions 7, 8, 9) are excluded from the relevance-weighted pools because their AI bridging scores are artificially inflated. The Religious and Secularist personas were excluded from those calculations, making those responses appear more pluralistic than they may actually be. They remain eligible for the random pool.

**Pool 1 — 2 highest bridging score responses** from the participant's relevant response set. These are responses where the AI evaluation found the highest pluralistic acceptability across value-diverse personas. Showing these to human participants tests whether humans agree with the AI evaluation's assessment of what constitutes a genuinely bridging response.

**Pool 2 — 2 highest discriminativeness responses** from the relevant response set not already selected. These are responses where AI personas disagreed most sharply, they had high standard deviation across persona scores. Showing these to human participants tests whether human value groups disagree in the same direction that AI personas disagree, which is the core validation question.

**Pool 3 — 2 random responses** from all remaining unseen responses across all axes. This ensures the full response set is eventually covered and prevents systematic bias toward only high-scoring responses.

A model diversity constraint ensures all three evaluated models (Claude 3.5 Haiku, GPT-4.1 Mini, Grok 4 Fast) are represented across the 6 responses, giving participants a basis for comparison across models on the results page.

When a participant requests more than 6 responses the same three-pool strategy is applied to the remaining unseen responses using the participant's stored axis scores.

Bridging scores and discriminativeness values are precomputed from the llm-pluralism evaluation pipeline and stored in `backend/app/data/question_score_discriminated.json`.

---

## Validation approach

Human ratings are compared to AI persona scores at the response level. For each response with sufficient human ratings the mean human rating from participants in each persona group is computed and correlated with the corresponding AI persona score.

A strong positive correlation between human persona group means and AI persona scores for the same responses would suggest the AI personas are reasonable proxies for real human value diversity on those topics. A weak or negative correlation would suggest the AI personas are not capturing real human reactions.

The progressive lean finding from the AI evaluation, that conservative-leaning personas consistently rate all models lower than progressive-leaning personas, is tested by comparing mean ratings across human persona groups. If human Libertarian participants give lower mean ratings than human Collectivist and Globalist participants the finding is validated with real human data.

The live data threshold requires at least 3 non-repeat participants with ratings in each of the 8 persona groups before the results comparison chart switches from AI evaluation data to live human aggregate data.

---

## Data collected per session

- Questionnaire answers (8 values questions, 1–5 scale)
- Assigned primary persona and axis scores across all 4 axes
- Response ratings (question_id, model, score 1–5, optional reasoning)
- Repeat session flag (detected via localStorage)

Sessions without any ratings are excluded from participant counts and aggregate analysis. Repeat sessions are stored but excluded from the live data threshold and aggregate comparisons.