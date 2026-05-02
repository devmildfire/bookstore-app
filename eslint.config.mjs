import nextConfig from 'eslint-config-next'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import prettierConfig from 'eslint-config-prettier'

export default [...nextConfig, ...nextCoreWebVitals, prettierConfig]
