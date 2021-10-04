import { createApp } from 'vue'

// Create App
import App from './App.vue'
const app = createApp(App)

// Router
import { router } from './router'
app.use(router)

// Styles
import './styles/index.sass'

// Icon
import { Icon } from '@vicons/utils'
app.component('Icon', Icon)

// External link
import ExternalLink from './components/ExternalLink.vue'
app.component('ELink', ExternalLink)

// LazyLoad
import Lazyload from './components/Lazyload.vue'
app.component('Lazyload', Lazyload)

// Mount
app.mount('#app')
