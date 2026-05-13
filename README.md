# LLM Pluralism Web

A human validation platform for the [llm-pluralism](https://github.com/willjgriff/llm-pluralism) evaluation framework. Participants answer a values questionnaire, rate AI responses on contested topics, and discover if AI is aligned with their worldview. Their ratings are used to validate whether AI persona-based evaluation scores correlate with real human value judgements.

For setup instructions see [SETUP.md](SETUP.md)

For live deployment see [makesafeai.org](https://makesafeai.org/?src=github)

## Research purpose

The [llm-pluralism](https://github.com/willjgriff/llm-pluralism) evaluation framework measures whether AI model responses are acceptable across genuinely different value perspectives using a panel of ideologically diverse AI personas as raters. A core limitation of that approach is that the personas are prompts applied to a single model, they may not faithfully represent the worldviews they describe.

This platform addresses that limitation by collecting ratings from real human participants for comparing to the AI persona scores. The key empirical question is: do people who hold Libertarian, Collectivist, Nationalist, Globalist, Tech Optimist, Tech Sceptic, Religious or Secularist values rate AI responses in the same direction as the corresponding AI personas? And secondly does the progressive lean finding from the AI evaluation, all frontier models scoring consistently low with the Libertarian persona, hold with real human raters?

## Participant flow

**Questionnaire** — 8 questions across 4 value axes in random order. Each question is rated 1 (strongly disagree) to 5 (strongly agree).

**Profile assignment** — axis scores are computed from question pairs and the participant is assigned a primary persona based on their dominant axis. The profile page shows their position on all four axes.

**Response rating** — participants rate 6 or more AI responses on a 1–5 reasonableness scale. Responses are selected using a stratified strategy designed to maximise validation signal.

**Results** — participants see their average rating of the AI responses, their value profile, and how their ratings compare to other persona groups.

Model identities are never shown during rating, all responses are presented blind.

## Persona assignment

Participants answer 8 questionnaire questions mapped to 4 opposing axis pairs:

| Axis | Question A | Question B | Negative score | Positive score |
|------|------------|------------|----------------|----------------|
| Economic | The state should redistribute wealth through taxation, even if this reduces incentives for individual effort | People who succeed should keep those rewards, equalising outcomes is not the government's role | Collectivist | Libertarian |
| Identity | A government's first obligation is to its own citizens, even when this means limiting help to people elsewhere | National boundaries should not be barriers to human flourishing. People, goods and ideas benefit from moving freely | Globalist | Nationalist |
| Technology | AI is moving too fast and poses risks society isn't ready to manage, caution should come before capability | AI's potential to solve humanity's problems is enormous, the risks of moving too slowly outweigh moving too fast | Tech Sceptic | Tech Optimist |
| Society | Religious values and faith communities should help shape laws and public policy. Society loses something essential without them | Laws and policy should be based on evidence and reasoning any citizen can evaluate, faith should remain private | Religious | Secularist |

Axis scores are computed as:

```
economic_score   = answers[1] - answers[0]
identity_score   = answers[2] - answers[3]
technology_score = answers[5] - answers[4]
society_score    = answers[7] - answers[6]
```

The primary persona is assigned based on the axis with the highest absolute score. If no axis exceeds a threshold of 2 the participant is assigned Centrist. In the case of a tie the first axis in list order (economic) wins.

A society axis (Religious vs Secularist) is included in the questionnaire for data collection purposes but is treated as secondary in the analysis. The corresponding AI personas produced structurally non-discriminating score distributions across three independent evaluation runs, likely because frontier models avoid taking strong positions on religion. Whether real human religious and secular participants show different discrimination patterns is an open research question this platform will help answer.

## Response selection

Each participant receives 6 responses selected from `responses_ordered.json` based on their questionnaire profile.

**Profile determination** — the participant's 8 questionnaire answers are reduced to four axis scores (economic, identity, technology, society). The dominant axis by absolute score becomes their primary axis. Scores below 2 on all axes are treated as centrist.

**For non-centrist participants**, 2 responses are drawn from each of two pre-ranked lists for their primary axis: one ordered by bridging score (responses with highest pluralistic acceptability across personas) and one ordered by standard deviation (responses where personas disagreed most sharply). The top 6 items from each list are weighted 5, 4, 3, 2, 1, 1 for sampling. The candidate pool expands beyond the top 6 if needed to satisfy the enforcement constraints below. Then 2 more at random are selected.

**For centrist participants**, all responses are drawn from the global pool directly at random.

The selection always enforces:
- exactly 6 responses per batch
- no repeated question IDs
- exactly 2 responses per model (Claude 3.5 Haiku, GPT-4.1 Mini, Grok 4 Fast)

When a participant requests more responses, the same process applies while excluding already-seen question IDs.

Bridging scores and standard deviation values are precomputed from the llm-pluralism evaluation pipeline and stored in `responses_ordered.json`.

## Validation approach

Human ratings are compared to AI persona scores at the response level. For each response with sufficient human ratings the mean human rating from participants in each persona group is computed and correlated with the corresponding AI persona score.

A strong positive correlation between human persona group means and AI persona scores for the same responses would suggest the AI personas are reasonable proxies for real human value diversity on those topics. A weak or negative correlation would suggest the AI personas are not capturing real human reactions.

The progressive lean finding from the AI evaluation, that conservative-leaning personas consistently rate all models lower than progressive-leaning personas, is tested by comparing mean ratings across human persona groups. If human Libertarian participants give lower mean ratings than human Collectivist and Globalist participants the finding is validated with real human data.

The live data threshold requires at least 3 non-repeat participants with ratings in each of the 8 persona groups before the results comparison chart switches from AI evaluation data to live human aggregate data.

## Data collected per session

- Questionnaire answers (8 values questions, 1–5 scale)
- Assigned primary persona and axis scores across all 4 axes
- Response ratings (question_id, model, score 1–5, optional reasoning)
- Repeat session flag (detected via localStorage)

Sessions without any ratings are excluded from participant counts and evaluation. Repeat sessions are stored and are excluded from participant counts and maybe evaluation.