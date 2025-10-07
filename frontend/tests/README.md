# Tests

Esta carpeta contiene todos los tests de la aplicación:

## Estructura

- **`unit/`** - Tests unitarios para componentes y funciones
- **`integration/`** - Tests de integración para flujos completos
- **`e2e/`** - Tests end-to-end con Cypress
- **`__mocks__/`** - Mocks para servicios externos

## Convenciones

- Usar Jest y Testing Library para tests unitarios
- Usar Cypress para tests E2E
- Seguir el patrón `*.test.ts` o `*.spec.ts`
- Mantener tests simples y enfocados
- Cubrir casos edge y errores
