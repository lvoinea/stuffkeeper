# README

## Install
- Initialize environment: `poetry install`
- Activate environemnt: `poetry shell`
- Create `.env` file based on the provided `.env.example`,
and place this in the execution folder (e.g., `backend/`)
- Run `alembic upgrade head`

## Run

```shell script
python backend/main.py
```

## Scripts

```shell script
python -m backend.scripts.create_test_data
```
