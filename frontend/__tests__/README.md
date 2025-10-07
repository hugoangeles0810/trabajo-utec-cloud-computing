# Testing Guide for Gamarriando Frontend

This directory contains all the test files for the Gamarriando frontend application.

## Test Structure

```
__tests__/
├── lib/
│   ├── constants/
│   │   └── query-keys.test.ts      # Tests for React Query keys
│   └── utils/
│       ├── cn.test.ts              # Tests for className utility
│       ├── format.test.ts          # Tests for formatting utilities
│       └── validation.test.ts      # Tests for validation utilities
└── README.md                       # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests for CI
```bash
npm run test:ci
```

## Test Configuration

The testing setup includes:

- **Jest** as the test runner
- **@testing-library/react** for React component testing
- **@testing-library/jest-dom** for custom Jest matchers
- **@testing-library/user-event** for user interaction simulation
- **jsdom** as the test environment

## Writing Tests

### Test Files Naming
- Test files should end with `.test.ts` or `.test.tsx`
- Place test files in the same directory as the code being tested or in `__tests__` folders

### Test Structure
```typescript
describe('Component or Function Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = functionToTest(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

### Testing Utilities

#### Validation Tests
Test validation functions with various inputs:
- Valid inputs
- Invalid inputs
- Edge cases
- Empty/null values

#### Format Tests
Test formatting functions with:
- Different input types
- Locale-specific formatting
- Edge cases (zero, negative numbers, etc.)

#### Query Keys Tests
Test React Query key generation:
- Base keys
- Keys with parameters
- Keys with filters

## Coverage Requirements

The project has coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Mock Data

For testing, use mock data from the `__tests__/setup/mocks.ts` file or create specific mock data in your test files.

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested
3. **Keep Tests Simple**: Each test should verify one specific behavior
4. **Use Appropriate Assertions**: Choose the right matcher for the type of assertion
5. **Mock External Dependencies**: Mock API calls, localStorage, etc.
6. **Test Edge Cases**: Include tests for boundary conditions and error states

## Common Patterns

### Testing Utility Functions
```typescript
describe('utilityFunction', () => {
  it('handles valid input', () => {
    expect(utilityFunction('valid')).toBe('expected')
  })
  
  it('handles invalid input', () => {
    expect(utilityFunction('invalid')).toBe('fallback')
  })
  
  it('handles edge cases', () => {
    expect(utilityFunction('')).toBe('')
    expect(utilityFunction(null)).toBe('')
  })
})
```

### Testing React Components
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
  
  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<Component />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Updated Text')).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure module paths are correct and components are properly exported
2. **Async Tests**: Use `async/await` or return promises for asynchronous operations
3. **Mock Issues**: Ensure mocks are properly configured and reset between tests
4. **Environment Issues**: Check that jsdom is properly configured for DOM testing

### Debug Tips

- Use `console.log` to debug test output
- Use `screen.debug()` to see the rendered DOM
- Use `--verbose` flag for detailed test output
- Use `--no-coverage` to run tests faster during development
