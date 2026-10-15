import vuetify from 'eslint-config-vuetify'

export default vuetify({
  ts: true,
  ignore: {
    extendIgnore: ['src/types/api.generated.ts', 'src/plugins/icons.generated.ts'],
  },
})
