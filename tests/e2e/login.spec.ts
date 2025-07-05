import { expect, test } from '@playwright/test'

test('login con tab admin seleccionado y formulario relleno', async ({ page }) => {
  await page.goto('/login')

  // Espera que el tab admin esté seleccionado
  await expect(page.locator('button[role="tab"][aria-selected="true"]')).toHaveText('Admin Demo')

  // Espera que el input email tenga el valor autocompletado
  await expect(page.locator('input[aria-label="Correo electrónico"]')).toHaveValue('admin@interdeco.mx')

  // Espera que el input password tenga el valor autocompletado
  await expect(page.locator('input[aria-label="Contraseña"]')).toHaveValue('iDeco#13122@')

  // Opcional: submit
  await page.click('button:has-text("Iniciar sesión")')

  // Verifica navegación o mensaje posterior (depende de tu app)
  await expect(page).toHaveURL('/')
})
