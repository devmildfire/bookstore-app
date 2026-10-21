#!/usr/bin/env python3
"""Track Supabase's own self-hosted stack for our Supabase images (policy: never run a
Supabase component AHEAD of supabase/supabase docker/docker-compose.yml, and follow it up).

Why: Renovate bumped postgres/storage-api past what Supabase itself ships and tests together
(2026-10: postgres 17.11 vs upstream 17.6.1, storage-api 1.83 vs 1.81). Upstream is the
integration-tested set; our candidate tests only prove boot/migration compatibility.

  supabase-upstream.py            report: ours vs upstream per service (exit 0)
  supabase-upstream.py --apply    rewrite deploy/production/docker-compose.yml pins UP to
                                  upstream's tag (+ its digest); never downgrades
  supabase-upstream.py --self-test

Report lines starting with "AHEAD" are policy violations (the weekly digest surfaces them).
Needs: python3 + PyYAML, network; --apply also needs `docker buildx` (digest lookup).
"""
import json, re, subprocess, sys, urllib.request

UPSTREAM = 'https://raw.githubusercontent.com/supabase/supabase/master/docker/docker-compose.yml'
COMPOSE = 'deploy/production/docker-compose.yml'
SERVICES = ['db', 'auth', 'rest', 'storage', 'meta', 'studio']  # same service names upstream

def vkey(tag):
    """'v2.197.0' / '17.6.1.136' / '2026.10.12-sha-3699278' → comparable int tuple."""
    return tuple(int(x) for x in re.findall(r'\d+', tag.lstrip('v').split('-')[0]))

def split_ref(ref):
    """'repo:tag@sha256:…' → (repo, tag, digest-or-None)."""
    m = re.fullmatch(r'(?P<repo>[^@]+?):(?P<tag>[^:@]+)(?:@(?P<dig>sha256:[0-9a-f]{64}))?', ref)
    if not m:
        raise ValueError(f'unparseable image ref: {ref}')
    return m['repo'], m['tag'], m['dig']

def images(compose_text):
    import yaml
    svcs = (yaml.safe_load(compose_text) or {}).get('services') or {}
    return {s: (svcs.get(s) or {}).get('image', '') for s in SERVICES}

def digest(ref):
    out = subprocess.run(['docker', 'buildx', 'imagetools', 'inspect', ref, '--format', '{{json .Manifest.Digest}}'],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)

def main(apply):
    up = images(urllib.request.urlopen(UPSTREAM, timeout=30).read().decode())
    text = open(COMPOSE).read()
    ours = images(text)
    changed = []
    for s in SERVICES:
        if not ours[s] or not up[s]:
            print(f'SKIP   {s}: missing ({ours[s] or "-"} / {up[s] or "-"})')
            continue
        repo, tag, dig = split_ref(ours[s])
        _, utag, _ = split_ref(up[s] if ':' in up[s] else up[s] + ':latest')
        # "Ahead" = ahead in the RELEASE LINE (first 3 parts). A newer build of the same line
        # (supabase/postgres 17.6.1.150 vs .136) is tolerated: prod already runs it, and
        # downgrading a live DB image to match is the worse risk.
        if vkey(tag)[:3] > vkey(utag)[:3]:
            print(f'AHEAD  {s}: {tag} > upstream {utag} — ahead of Supabase\'s tested stack')
        elif vkey(tag) == vkey(utag):
            print(f'OK     {s}: {tag} (= upstream)')
        elif vkey(tag) > vkey(utag):
            print(f'OK     {s}: {tag} (newer build of upstream line {utag})')
        else:
            print(f'BEHIND {s}: {tag} < upstream {utag}')
            if apply:
                new = f'{repo}:{utag}@{digest(f"{repo}:{utag}")}'
                text = text.replace(ours[s], new, 1)
                changed.append(f'{s}: {tag} → {utag}')
    if apply and changed:
        open(COMPOSE, 'w').write(text)
        print('UPDATED ' + '; '.join(changed))

if __name__ == '__main__':
    if sys.argv[1:] == ['--self-test']:
        assert vkey('v2.197.0') > vkey('v2.193.1')
        assert vkey('17.6.1.150') > vkey('17.6.1.136') and vkey('17.11.0.004') > vkey('17.6.1.150')
        assert vkey('v14.18') > vkey('v14.10')  # numeric, not lexicographic
        assert vkey('2026.10.12-sha-3699278') > vkey('2026.04.28-sha-89d08a2')
        assert vkey('17.6.1.150')[:3] == vkey('17.6.1.136')[:3]          # same line → not AHEAD
        assert vkey('17.11.0.006')[:3] > vkey('17.6.1.136')[:3]          # newer line → AHEAD
        assert split_ref('public.ecr.aws/supabase/gotrue:v2.1@sha256:' + 'a' * 64)[1] == 'v2.1'
        assert split_ref('postgrest/postgrest:v14.18') == ('postgrest/postgrest', 'v14.18', None)
        print('self-test ok')
    else:
        main('--apply' in sys.argv[1:])
