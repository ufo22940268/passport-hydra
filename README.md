# passport-hydra

passport strategy for hydra.

## Setup hydra

Refer to https://www.ory.sh/docs/oryos.9/hydra/5min-tutorial.

The only difference when the creating application script you should add `--token-endpoint-auth-method client_secret_post`.

    docker-compose -f quickstart.yml exec hydra \
        hydra clients create \
        --endpoint http://127.0.0.1:4445 \
        --id auth-code-client6 \
        --secret secret \
        --grant-types authorization_code,refresh_token \
        --response-types code,id_token \
        --scope openid,offline \
        --callbacks http://127.0.0.1:3001/login/callback \
        --token-endpoint-auth-method client_secret_post

## Tools

### Flush tokens

    docker exec 2d7392bb1fa4 hydra token --endpoint http://127.0.0.1:4445  flush
