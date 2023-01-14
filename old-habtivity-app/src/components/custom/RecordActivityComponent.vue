<template>
  <div>

    <FormulateForm
    v-model="values"
    @submit="handleLogin"
  >
    <h2>Login</h2>
    <FormulateInput type="text" name="email" label="Email address" validation="required|email" />
    <FormulateInput type="text" name="password" label="Password" validation="required" />
    <FormulateInput name="terms" type="checkbox" label="I accept, just don't make me read the terms." validation="accepted" />
    <FormulateInput type="submit" label="Login" />
    <pre>{{ values }}</pre>
  </FormulateForm>

    <label>Activity title</label>
    <input
      type="text"
      :value="activityTitle"
      @input="$emit('update:activityTitle', $event.target.value)"
    />

    <label>Area</label>
    <input
      type="text"
      :value="area"
      @input="$emit('update:area', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  props: {
    activityTitle: String,
    area: String
  },
  data () { 
    return { 
      values: {}, 
      handleLogin: () => alert('Logged in') 
    } 
  }
};
</script>
