import { createApp } from 'vue'

import App from './App.vue'
import { vuetify } from './plugins/vuetify.js'
import { formkitConfig } from './plugins/formkit.js'
import { router } from './router/index.js'

import { plugin as formkitPlugin } from '@formkit/vue'

const app = createApp(App)

app.use(vuetify)
app.use(router)
// FormKit is global so <FormKit> / <FormKitMessages> work in the FormKit page.
// It coexists fine with the other libraries, which are component-scoped.
app.use(formkitPlugin, formkitConfig)

app.mount('#app')
