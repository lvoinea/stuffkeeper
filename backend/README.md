# README

## Install
- Initialize environment: `poetry install`
- Activate environemnt: `poetry shell`
- Create `.env` file based on the provided `.env.example`,
and place this in the execution folder (e.g., `backend/`)
- Run `alembic upgrade head`

## Run

Create config in `.env` in `local`
```shell script
SECRET_KEY=1234
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

```shell script
python backend/main.py
```

## Scripts

```shell script
python -m backend.scripts.create_test_data
```
