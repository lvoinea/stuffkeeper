FROM python:3.8.3-slim as build
RUN apt-get update\
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends build-essential gcc\
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/stuffkeeper
RUN python -m pip install --upgrade pip

ENV PATH=/usr/stuffkeeper/venv/bin:$PATH

ENV PIP_DEFAULT_TIMEOUT=100 \
    # Allow statements and log messages to immediately appear
    PYTHONUNBUFFERED=1 \
    # cache is useless in docker image, so disable to reduce image size
    PIP_NO_CACHE_DIR=1\
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    POETRY_HOME="/opt/poetry" \
    POETRY_VERSION=1.3.2 \
    # make poetry create the virtual environment in the project's root
    # it gets named `.venv`
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    # make poetry install to this location
    POETRY_HOME="/opt/poetry" \
    # do not ask any interactive question
    POETRY_NO_INTERACTION=1

ARG POETRY_VERSION=1.3.2

RUN pip install "poetry==$POETRY_VERSION"

COPY pyproject.toml poetry.lock ./

RUN poetry install --no-ansi

#------------------------------------------------------------

FROM python:3.8.3-slim as final

RUN groupadd -g 9999 python && \
    useradd -r -u 9999 -g python python

RUN mkdir /usr/stuffkeeper && chown python:python /usr/stuffkeeper
WORKDIR /usr/stuffkeeper

COPY  --chown=python:python --from=build /usr/stuffkeeper/.venv ./.venv
COPY  --chown=python:python alembic.ini pyproject.toml ./
COPY  --chown=python:python alembic ./alembic
COPY  --chown=python:python app ./app
COPY  --chown=python:python backend ./backend

EXPOSE 8000

USER 9999

ENV PATH=/usr/stuffkeeper/.venv/bin:$PATH
ENV PYTHONPATH=/usr/stuffkeeper

ENTRYPOINT ["python", "backend/main.py"]

#ENTRYPOINT ["/bin/bash"]