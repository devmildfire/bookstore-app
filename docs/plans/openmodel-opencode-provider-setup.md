# OpenModel Provider Setup for OpenCode CLI

Goal: configure OpenCode CLI to use OpenModel models, verify the provider works, and record the working model IDs. Do the smallest working setup first.

## Known Facts

- OpenModel base URL: `https://api.openmodel.ai/v1`
- API key env var to use locally: `OPENMODEL_API_KEY`
- OpenModel supports more than one API shape:
  - Anthropic Messages: `/v1/messages`
  - OpenAI Responses: `/v1/responses`
  - Gemini GenerateContent for Gemini models
- OpenModel says `/v1/chat/completions` is removed. Do not configure it as an old Chat Completions provider unless a test proves that endpoint exists again.
- Event/free model: `deepseek-v4-flash`
- GLM model from the event/pricing page: `glm-5.2`

## Setup Order

1. Export the key:

```bash
export OPENMODEL_API_KEY="om-..."
```

2. Confirm the key can list models:

```bash
curl -sS https://api.openmodel.ai/v1/models \
  -H "Authorization: Bearer $OPENMODEL_API_KEY"
```

Expected: JSON with model IDs. Save the exact IDs you plan to use. Do not guess casing.

3. Add an OpenModel provider to OpenCode config.

Use the global config unless this is only for one repo:

```text
~/.config/opencode/opencode.jsonc
```

Start with the Responses protocol because OpenCode documents `@ai-sdk/openai` for `/v1/responses`.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "openmodel": {
      "npm": "@ai-sdk/openai",
      "name": "OpenModel",
      "options": {
        "baseURL": "https://api.openmodel.ai/v1",
        "apiKey": "{env:OPENMODEL_API_KEY}"
      },
      "models": {
        "glm-5.2": {
          "name": "GLM 5.2 via OpenModel"
        },
        "qwen3-max": {
          "name": "Qwen3 Max via OpenModel"
        },
        "gpt-5.5": {
          "name": "GPT 5.5 via OpenModel"
        }
      }
    }
  }
}
```

If `glm-5.2`, `qwen3-max`, or `gpt-5.5` are not in `/v1/models`, replace them with exact IDs returned by OpenModel.

## DeepSeek V4 Flash

`deepseek-v4-flash` is advertised by OpenModel as Anthropic-compatible and free during the event. If the Responses provider setup does not expose it, configure it through an Anthropic-compatible provider path instead.

First test the raw Anthropic Messages endpoint:

```bash
curl -sS https://api.openmodel.ai/v1/messages \
  -H "Authorization: Bearer $OPENMODEL_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4-flash",
    "max_tokens": 128,
    "messages": [
      { "role": "user", "content": "Reply with exactly: openmodel-ok" }
    ]
  }'
```

Expected: response content includes `openmodel-ok`.

If raw curl works but OpenCode cannot call it through the `openmodel` provider above, do not force it through `/v1/responses`. Configure a separate Anthropic-style provider if OpenCode supports it in the installed version, or use a small LiteLLM/AI Gateway bridge.

## OpenCode Verification

1. Start OpenCode:

```bash
opencode
```

2. Run:

```text
/models
```

Expected: `OpenModel` appears and the configured model IDs are selectable.

3. Select one Responses-compatible model first, for example `glm-5.2`.

4. Ask a deterministic smoke prompt:

```text
Reply with exactly: openmodel-ok
```

Expected: `openmodel-ok`.

5. Run one tool-use smoke test in a disposable directory:

```text
Create a file named openmodel-smoke.txt containing exactly openmodel-ok, then show the file contents.
```

Expected:

- OpenCode asks for normal file-write approval.
- File is created.
- Contents are exactly `openmodel-ok`.

6. Clean up:

```bash
rm openmodel-smoke.txt
```

Ask before deleting if the file is not in a disposable directory.

## Failure Modes

- `404 /v1/chat/completions`: wrong provider package. Use `@ai-sdk/openai` for Responses, not `@ai-sdk/openai-compatible`.
- `model_not_found`: use `GET /v1/models` and copy the exact model ID.
- `401`: key is missing, wrong, or not passed through `{env:OPENMODEL_API_KEY}`.
- `429`: event/free tier is rate-limited. Wait or try a paid discounted model.
- DeepSeek works in curl but not OpenCode: OpenCode path is likely using Responses, while DeepSeek is on Messages. Use Anthropic-compatible config or a bridge.

## Done Criteria

- `/v1/models` works with the API key.
- OpenCode lists the OpenModel provider.
- At least one model responds inside OpenCode.
- A disposable file-write task succeeds.
- Working model IDs and any caveats are written back into this document or a short local note.
