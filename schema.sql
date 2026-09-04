-- Cible PostgreSQL (V2). La V1 utilise des fichiers JSON dans /data
-- avec les mêmes entités.

CREATE TABLE weather_observations (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  source TEXT NOT NULL,
  value DOUBLE PRECISION,
  unit TEXT NOT NULL,
  quality SMALLINT,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE weather_forecasts (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  source TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE water_temperature (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source TEXT NOT NULL,
  value DOUBLE PRECISION,
  unit TEXT DEFAULT '°C',
  quality SMALLINT,
  kind TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fishing_scores (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  total SMALLINT,
  factors JSONB,
  confidence SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE historical_conditions (
  id BIGSERIAL PRIMARY KEY,
  day DATE NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  source TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE locations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);

CREATE TABLE fishing_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  started_at TIMESTAMPTZ NOT NULL,
  duration_h NUMERIC,
  species TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE catches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  caught_at TIMESTAMPTZ NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  species TEXT NOT NULL,
  length_cm NUMERIC,
  weight_kg NUMERIC,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
