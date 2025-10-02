# Google Chat Cards v2 n8n Node - Implementation Scratchpad

## 🎯 Core Challenge Analysis

### 1. **Complexity of Cards v2 API Structure**
The Google Chat Cards v2 API is deeply nested with multiple component types:

```typescript
// Simplified structure showing nesting complexity
interface Card {
  header?: CardHeader;
  sections: Section[];
  cardActions?: CardAction[];
  name?: string;
  fixedFooter?: CardFixedFooter;
  displayStyle?: DisplayStyle;
  peekCardHeader?: CardHeader;
}

interface Section {
  header?: string;
  widgets: Widget[];  // This is where complexity explodes
  collapsible?: boolean;
  uncollapsibleWidgetsCount?: number;
}

interface Widget {
  // Union type of 10+ different widget types
  textParagraph?: TextParagraph;
  image?: Image;
  decoratedText?: DecoratedText;
  buttonList?: ButtonList;
  textInput?: TextInput;
  selectionInput?: SelectionInput;
  dateTimePicker?: DateTimePicker;
  divider?: Divider;
  grid?: Grid;
  columns?: Columns;
}
```

**Challenge**: How to represent this in n8n's UI without overwhelming users?

**Solution Approach**:
- Use a **progressive disclosure** pattern
- Start with a simple "Add Widget" button
- Show only relevant fields based on widget type selection
- Group related properties in collapsible sections

### 2. **Dynamic Form Generation in n8n**

n8n uses a property-based system for node configuration:

```typescript
properties: INodeProperties[] = [
  {
    displayName: 'Widget Type',
    name: 'widgetType',
    type: 'options',
    options: [
      { name: 'Text', value: 'text' },
      { name: 'Image', value: 'image' },
      { name: 'Button', value: 'button' },
      // ... more widget types
    ],
  },
  // Problem: How to show different fields based on widget type?
]
```

**Challenge**: n8n's `displayOptions` with `show/hide` conditions can become extremely complex with nested structures.

**Solution Approach**:
```typescript
// Use fixedCollection for dynamic widget arrays
{
  displayName: 'Card Sections',
  name: 'sections',
  type: 'fixedCollection',
  typeOptions: {
    multipleValues: true,
    sortable: true,
  },
  default: {},
  options: [
    {
      name: 'section',
      displayName: 'Section',
      values: [
        {
          displayName: 'Section Title',
          name: 'title',
          type: 'string',
          default: '',
        },
        {
          displayName: 'Widgets',
          name: 'widgets',
          type: 'fixedCollection',
          typeOptions: {
            multipleValues: true,
            sortable: true,
          },
          options: [
            // Define each widget type as a separate collection
            {
              name: 'textWidget',
              displayName: 'Text',
              values: [/* text-specific fields */]
            },
            {
              name: 'imageWidget',
              displayName: 'Image',
              values: [/* image-specific fields */]
            },
            // ... other widget types
          ]
        }
      ]
    }
  ]
}
```

### 3. **Interactive Elements & Actions**

Cards v2 supports complex interactions:
- onClick actions (open link, open dialog, trigger function)
- Form submissions with validation
- Dynamic card updates

**Challenge**: How to handle action configurations that reference other parts of the workflow?

**Solution Approach**:
```typescript
// Action configuration structure
{
  displayName: 'Button Action',
  name: 'onClick',
  type: 'options',
  options: [
    {
      name: 'Open Link',
      value: 'openLink',
    },
    {
      name: 'Submit Form',
      value: 'submitForm',
    },
    {
      name: 'Execute Workflow',
      value: 'executeAction',
    },
  ],
},
{
  displayName: 'Action URL',
  name: 'actionUrl',
  type: 'string',
  displayOptions: {
    show: {
      onClick: ['openLink'],
    },
  },
},
{
  displayName: 'Action Parameters',
  name: 'actionParameters',
  type: 'json',
  displayOptions: {
    show: {
      onClick: ['executeAction'],
    },
  },
}
```

### 4. **Template System Implementation**

**Challenge**: How to provide templates while allowing customization?

**Solution Approach**:
```typescript
// Template structure
interface CardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'notification' | 'approval' | 'form' | 'report';
  thumbnail?: string;
  cardJson: any;  // The actual card structure
  variables: TemplateVariable[];  // Customizable parts
}

interface TemplateVariable {
  path: string;  // JSONPath to the field
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'image';
  default: any;
}

// In the node
{
  displayName: 'Card Template',
  name: 'template',
  type: 'options',
  default: 'blank',
  options: [
    {
      name: 'Blank Card',
      value: 'blank',
    },
    {
      name: 'Simple Notification',
      value: 'notification',
    },
    {
      name: 'Approval Request',
      value: 'approval',
    },
    {
      name: 'Data Collection Form',
      value: 'form',
    },
    // ... more templates
  ],
},
```

### 5. **JSON Mode vs Builder Mode Synchronization**

**Challenge**: Users might want to switch between visual builder and JSON mode.

**Solution Approach**:
- Bidirectional conversion functions
- Validation when switching modes
- Warning if JSON has features not supported in builder

```typescript
class CardConverter {
  static builderToJson(builderData: any): GoogleChatCard {
    // Convert n8n form data to Google Chat Card JSON
  }

  static jsonToBuilder(cardJson: GoogleChatCard): any {
    // Parse JSON and populate n8n form fields
    // May lose some advanced features - need to warn user
  }

  static validateConversion(cardJson: GoogleChatCard): ValidationResult {
    return {
      isFullySupported: boolean;
      warnings: string[];
      unsupportedFeatures: string[];
    };
  }
}
```

### 6. **Testing Complex Scenarios**

**Challenge**: How to test all widget combinations and interactions?

**Test Strategy**:
1. Unit tests for each widget builder
2. Integration tests for card generation
3. Mock Google Chat API for response testing
4. Visual regression tests for card preview

```typescript
// Test structure
describe('GoogleChatCardsV2Node', () => {
  describe('Widget Builders', () => {
    test('should build text paragraph widget', () => {
      const input = { text: 'Hello', format: 'bold' };
      const widget = buildTextWidget(input);
      expect(widget).toMatchSnapshot();
    });
  });

  describe('Card Generation', () => {
    test('should generate valid card JSON from builder input', () => {
      const builderInput = /* ... */;
      const card = generateCard(builderInput);
      expect(validateCardSchema(card)).toBe(true);
    });
  });
});
```

## 🔧 Technical Implementation Details

### File Structure Deep Dive

```
n8n-nodes-google-chat-cards-v2/
├── nodes/
│   └── GoogleChatCardsV2/
│       ├── GoogleChatCardsV2.node.ts       # Main node class
│       ├── GoogleChatCardsV2.node.json     # Node metadata
│       ├── types/
│       │   ├── GoogleChatTypes.ts          # API type definitions
│       │   └── NodeTypes.ts                # n8n property types
│       ├── builders/
│       │   ├── CardBuilder.ts              # Main card builder
│       │   ├── WidgetBuilder.ts            # Widget factory
│       │   ├── TextWidgetBuilder.ts        # Text paragraph builder
│       │   ├── ImageWidgetBuilder.ts       # Image widget builder
│       │   ├── ButtonWidgetBuilder.ts      # Button builder
│       │   ├── FormWidgetBuilder.ts        # Form input builders
│       │   └── SectionBuilder.ts           # Section builder
│       ├── templates/
│       │   ├── TemplateManager.ts          # Template system
│       │   ├── templates.json              # Template definitions
│       │   └── previews/                   # Template preview images
│       ├── validators/
│       │   ├── CardValidator.ts            # Card structure validation
│       │   └── ActionValidator.ts          # Action validation
│       └── utils/
│           ├── Converter.ts                # JSON <-> Builder conversion
│           └── Preview.ts                  # Card preview generator
├── credentials/
│   └── GoogleChatApi.credentials.ts        # Reuse existing
├── test/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── USAGE.md
│   └── examples/
└── package.json
```

### Core Node Implementation

```typescript
// GoogleChatCardsV2.node.ts - Skeleton
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

export class GoogleChatCardsV2 implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Google Chat Cards v2',
    name: 'googleChatCardsV2',
    icon: 'file:googleChat.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Send rich card messages to Google Chat',
    defaults: {
      name: 'Google Chat Cards v2',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'googleChatOAuth2Api',
        required: true,
      },
    ],
    properties: [
      // Mode selection
      {
        displayName: 'Build Mode',
        name: 'buildMode',
        type: 'options',
        default: 'simple',
        options: [
          {
            name: 'Simple Card',
            value: 'simple',
            description: 'Quick card with basic elements',
          },
          {
            name: 'Card Builder',
            value: 'builder',
            description: 'Visual card builder with all widgets',
          },
          {
            name: 'From Template',
            value: 'template',
            description: 'Start from a pre-built template',
          },
          {
            name: 'JSON Input',
            value: 'json',
            description: 'Provide raw JSON (advanced)',
          },
        ],
      },
      // ... dynamic properties based on mode
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const buildMode = this.getNodeParameter('buildMode', 0) as string;

    // Build card based on mode
    let card: any;
    switch (buildMode) {
      case 'simple':
        card = await this.buildSimpleCard();
        break;
      case 'builder':
        card = await this.buildFromBuilder();
        break;
      case 'template':
        card = await this.buildFromTemplate();
        break;
      case 'json':
        card = await this.buildFromJson();
        break;
    }

    // Send to Google Chat
    const response = await this.sendCardToChat(card);

    return this.prepareOutputData([{ json: response }]);
  }
}
```

### Complex UI Patterns

```typescript
// Dynamic widget property generation
const generateWidgetProperties = (widgetType: string): INodeProperties[] => {
  const baseProperties: INodeProperties[] = [
    {
      displayName: 'Widget ID',
      name: 'widgetId',
      type: 'string',
      default: '',
      description: 'Unique identifier for this widget',
    },
  ];

  switch (widgetType) {
    case 'text':
      return [
        ...baseProperties,
        {
          displayName: 'Text Content',
          name: 'text',
          type: 'string',
          typeOptions: {
            rows: 4,
          },
          default: '',
          description: 'The text to display',
        },
        {
          displayName: 'Text Format',
          name: 'format',
          type: 'options',
          default: 'plain',
          options: [
            { name: 'Plain Text', value: 'plain' },
            { name: 'Markdown', value: 'markdown' },
            { name: 'HTML', value: 'html' },
          ],
        },
      ];

    case 'image':
      return [
        ...baseProperties,
        {
          displayName: 'Image URL',
          name: 'imageUrl',
          type: 'string',
          default: '',
          description: 'HTTPS URL of the image',
        },
        {
          displayName: 'Alt Text',
          name: 'altText',
          type: 'string',
          default: '',
          description: 'Alternative text for accessibility',
        },
        {
          displayName: 'On Click',
          name: 'onClick',
          type: 'collection',
          placeholder: 'Add Click Action',
          default: {},
          options: [
            // Click action properties
          ],
        },
      ];

    // ... other widget types
  }

  return baseProperties;
};
```

## 🚧 Specific Challenges & Solutions

### Challenge 1: Widget Array Management
**Problem**: n8n's fixedCollection can become unwieldy with many widget types.

**Solution**: Create a custom property type that dynamically generates widget fields:
```typescript
// Custom widget collection handler
{
  displayName: 'Widgets',
  name: 'widgets',
  type: 'collection',
  typeOptions: {
    multipleValues: true,
    multipleValueButtonText: 'Add Widget',
    sortable: true,
  },
  default: {},
  options: [
    {
      displayName: 'Widget Type',
      name: 'type',
      type: 'options',
      default: 'text',
      options: widgetTypeOptions,
    },
    // Dynamic fields based on widget type
    ...generateDynamicFields('{{$parameter.type}}'),
  ],
}
```

### Challenge 2: Preview Generation
**Problem**: Showing real-time preview of the card being built.

**Solution**: Generate HTML preview that mimics Google Chat's rendering:
```typescript
class CardPreviewGenerator {
  static generatePreview(cardData: any): string {
    // Convert card data to HTML that looks like Google Chat
    return `
      <div class="google-chat-card-preview">
        <style>
          .google-chat-card-preview {
            font-family: 'Google Sans', Roboto, sans-serif;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
            padding: 16px;
            max-width: 480px;
          }
          /* ... more styles */
        </style>
        ${this.renderCard(cardData)}
      </div>
    `;
  }
}
```

### Challenge 3: Handling Nested Actions
**Problem**: Actions can trigger other cards or dialogs with their own structure.

**Solution**: Implement action chaining with validation:
```typescript
interface ActionChain {
  primaryAction: Action;
  followUpCard?: Card;
  dialog?: Dialog;
  parameters: Record<string, any>;
}

class ActionBuilder {
  static buildActionChain(config: any): ActionChain {
    // Validate action configuration
    // Build nested structures if needed
    // Return complete action chain
  }
}
```

### Challenge 4: Error Handling & Validation
**Problem**: Complex nested structures can have many validation points.

**Solution**: Comprehensive validation with helpful error messages:
```typescript
class CardValidator {
  static validate(card: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!card.sections || card.sections.length === 0) {
      errors.push({
        field: 'sections',
        message: 'Card must have at least one section',
        severity: 'error',
      });
    }

    // Check widget limits
    const widgetCount = this.countWidgets(card);
    if (widgetCount > 100) {
      errors.push({
        field: 'widgets',
        message: `Card has ${widgetCount} widgets, maximum is 100`,
        severity: 'error',
      });
    }

    // Check image URLs
    card.sections.forEach((section, sIndex) => {
      section.widgets?.forEach((widget, wIndex) => {
        if (widget.image && !widget.image.imageUrl.startsWith('https://')) {
          errors.push({
            field: `sections[${sIndex}].widgets[${wIndex}].image.imageUrl`,
            message: 'Image URLs must use HTTPS',
            severity: 'error',
          });
        }
      });
    });

    return { valid: errors.length === 0, errors, warnings };
  }
}
```

## 📋 Implementation Checklist

### Phase 1: Foundation
- [ ] Initialize npm package with n8n-nodes structure
- [ ] Set up TypeScript with proper types for Google Chat API
- [ ] Create base node class with credential handling
- [ ] Implement basic message sending functionality
- [ ] Set up development environment with n8n

### Phase 2: Simple Mode
- [ ] Create simple card builder (header + text + button)
- [ ] Implement card-to-JSON converter
- [ ] Add space/thread selection
- [ ] Test basic card sending
- [ ] Add error handling for API responses

### Phase 3: Widget System
- [ ] Define TypeScript interfaces for all widget types
- [ ] Create widget builder classes
- [ ] Implement TextParagraph widget
- [ ] Implement Image widget with onClick
- [ ] Implement DecoratedText widget
- [ ] Implement Button and ButtonList
- [ ] Implement form input widgets (TextInput, SelectionInput)
- [ ] Implement layout widgets (Divider, Grid, Columns)

### Phase 4: Builder Mode UI
- [ ] Design fixedCollection structure for sections
- [ ] Create dynamic widget property generation
- [ ] Implement add/remove/reorder functionality
- [ ] Add widget-specific property panels
- [ ] Create validation feedback UI
- [ ] Add helper text and documentation links

### Phase 5: Template System
- [ ] Design template data structure
- [ ] Create initial template library
- [ ] Implement template selection UI
- [ ] Add template customization options
- [ ] Create template preview system
- [ ] Allow saving custom templates

### Phase 6: Advanced Features
- [ ] Implement JSON mode with syntax highlighting
- [ ] Add bidirectional mode conversion
- [ ] Create card preview generator
- [ ] Implement action builders (onClick, forms)
- [ ] Add webhook response handling
- [ ] Support card updates and threading

### Phase 7: Testing & Documentation
- [ ] Write unit tests for builders
- [ ] Create integration tests with mock API
- [ ] Test with real Google Chat workspace
- [ ] Write comprehensive documentation
- [ ] Create example workflows
- [ ] Add inline help and tooltips

### Phase 8: Optimization & Polish
- [ ] Optimize bundle size
- [ ] Improve UI performance with large cards
- [ ] Add keyboard shortcuts for builder
- [ ] Implement undo/redo for builder
- [ ] Add card duplication feature
- [ ] Create migration guide from JSON mode

## 🎯 Success Metrics

1. **Usability**: Users can create a basic card in < 30 seconds
2. **Feature Coverage**: Support 90%+ of Cards v2 API features
3. **Error Reduction**: 80% fewer errors vs. raw JSON input
4. **Template Usage**: 5+ production-ready templates
5. **Performance**: Card generation < 100ms
6. **Adoption**: Replace need for JSON in 95% of use cases

## 🤔 Open Questions

1. Should we support card carousels (multiple cards)?
2. How to handle dialog responses and multi-step forms?
3. Should templates be stored locally or fetched from a registry?
4. How to handle versioning when Cards API updates?
5. Should we add a "Import from Chat Builder" feature for the Google tool?
6. How to handle collaborative features (multiple people editing)?

## 📝 Grid Widget Implementation Notes (v0.2.x Fix)

### Current Issue
The Grid widget implementation is confusing because it uses "Rows" with comma-separated "Cells", which doesn't align with how Google Chat's Grid widget actually works.

### How Google Chat Grid Actually Works
```json
{
  "grid": {
    "title": "Grid Title",
    "columnCount": 2,  // Number of columns (1-4)
    "items": [  // Array of items, NOT rows
      {
        "id": "item1",
        "image": {
          "imageUri": "https://example.com/image1.png",
          "cropStyle": { "type": "SQUARE" }
        },
        "title": "Item 1 Title",
        "subtitle": "Item 1 Subtitle"
      },
      {
        "id": "item2",
        "image": {
          "imageUri": "https://example.com/image2.png"
        },
        "title": "Item 2 Title",
        "subtitle": "Item 2 Subtitle"
      }
      // Items are automatically arranged into rows based on columnCount
      // 6 items with 2 columns = 3 rows automatically
    ]
  }
}
```

### The Problem with Current Implementation
- UI shows "Rows" → "Cells" with comma-separated values
- This creates confusion - users think they're defining rows
- Google Chat doesn't work with rows, it works with items and columns
- The comma-separated approach doesn't support rich item properties

### Correct Implementation Design
```typescript
// Instead of:
{
  name: 'rows',
  type: 'fixedCollection',
  options: [{
    name: 'row',
    values: [{
      name: 'cells',
      type: 'string',  // "Cell1, Cell2, Cell3"
    }]
  }]
}

// Should be:
{
  name: 'items',
  type: 'fixedCollection',
  options: [{
    name: 'gridItem',
    values: [
      {
        name: 'title',
        type: 'string',
        description: 'Item title text'
      },
      {
        name: 'subtitle',
        type: 'string',
        description: 'Item subtitle (optional)'
      },
      {
        name: 'imageUri',
        type: 'string',
        description: 'Item image URL (optional)'
      },
      {
        name: 'imageStyle',
        type: 'options',
        options: ['SQUARE', 'CIRCLE']
      },
      {
        name: 'onClickUrl',
        type: 'string',
        description: 'URL to open when item is clicked'
      }
    ]
  }]
}
```

### Visual Example
**Current (Confusing)**:
```
Grid Title: [Product Grid]
Rows:
  Row 1: Cells: "Product A, $19.99, In Stock"
  Row 2: Cells: "Product B, $29.99, Out of Stock"
Column Count: [3]
```

**Fixed (Clear)**:
```
Grid Title: [Product Grid]
Column Count: [2]
Grid Items:
  Item 1:
    - Title: Product A
    - Subtitle: $19.99
    - Image: https://...
  Item 2:
    - Title: Product B
    - Subtitle: $29.99
    - Image: https://...
  Item 3:
    - Title: Product C
    - Subtitle: $39.99
    - Image: https://...
  Item 4:
    - Title: Product D
    - Subtitle: $49.99
    - Image: https://...
```
With 2 columns, these 4 items automatically become 2 rows.

## 🚀 MVP Definition

**Minimum Viable Product includes:**
- Simple mode with basic card elements
- Support for 5 core widgets (text, image, button, divider, decorated text)
- Template library with 3 templates
- JSON mode for advanced users
- Proper error handling and validation
- Basic documentation

**Not in MVP (Phase 2):**
- Full visual builder with drag-drop
- Card preview
- Advanced form widgets
- Dialog support
- Custom template saving
- Webhook response handling