import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' }
})

// ─── Prediction Endpoints ──────────────────────────────────
export const predictImage = (formData) =>
    api.post('/predict/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

export const predictTimeseries = (formData) =>
    api.post('/predict/timeseries', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

export const getRiskScore = (lat, lng) =>
    api.get('/predict/risk-score', { params: { lat, lng } })

// ─── Weather Endpoints (Open-Meteo via backend) ─────────────
export const getCurrentWeather = (lat, lng) =>
    api.get('/weather/current', { params: { lat, lng } })

export const getWeatherHistory = (lat, lng, hours = 48) =>
    api.get('/weather/history', { params: { lat, lng, hours } })

export const getWeatherForecast = (lat, lng) =>
    api.get('/weather/forecast', { params: { lat, lng } })

// ─── Map Endpoints ─────────────────────────────────────────
export const getFloodZones = (lat, lng) =>
    api.get('/map/flood-zones', { params: { lat, lng } })

export const getEvacuationRoute = (originLat, originLng, destLat, destLng) =>
    api.get('/map/evacuation-route', {
        params: { origin_lat: originLat, origin_lng: originLng, dest_lat: destLat, dest_lng: destLng }
    })

export const getSensors = (lat, lng) =>
    api.get('/map/sensors', { params: { lat, lng } })

export const getInfrastructure = (lat, lng) =>
    api.get('/map/infrastructure', { params: { lat, lng } })

// ─── Sensor Endpoints ──────────────────────────────────────
export const listSensors = (lat, lng) =>
    api.get('/sensors', { params: { lat, lng } })

export const getSensorLevels = (lat, lng) =>
    api.get('/sensors/levels', { params: { lat, lng } })

export const getSensorHistory = (id) =>
    api.get(`/sensors/${id}`)

export const ingestSensorData = (data) =>
    api.post('/sensors/ingest', data)

export default api
