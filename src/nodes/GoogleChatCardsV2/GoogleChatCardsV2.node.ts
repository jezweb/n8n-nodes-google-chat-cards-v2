import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IHttpRequestMethods,
	IHttpRequestOptions,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

export class GoogleChatCardsV2 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Google Chat Cards v2',
		name: 'googleChatCardsV2',
		icon: 'file:googlechat.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["buildMode"] + " mode"}}',
		description: 'Send rich card messages to Google Chat with visual builder',
		defaults: {
			name: 'Google Chat Cards v2',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'googleChatOAuth2Api',
				required: false,
				displayOptions: {
					show: {
						authMethod: ['oauth2'],
					},
				},
			},
		],
		properties: [
			// Authentication Method
			{
				displayName: 'Authentication Method',
				name: 'authMethod',
				type: 'options',
				default: 'webhook',
				description: 'How to authenticate with Google Chat',
				options: [
					{
						name: 'Webhook URL (Simple)',
						value: 'webhook',
						description: 'Just paste your webhook URL - easiest setup for sending messages',
					},
					{
						name: 'OAuth2 (Advanced)',
						value: 'oauth2',
						description: 'For listing spaces and interactive features',
					},
				],
			},
			// Webhook URL
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'https://chat.googleapis.com/v1/spaces/XXX/messages?key=XXX&token=XXX',
				description: 'Paste your Google Chat webhook URL here. Get it from your space settings.',
				required: true,
				displayOptions: {
					show: {
						authMethod: ['webhook'],
					},
				},
			},
			// Space/Thread Selection (OAuth2 only)
			{
				displayName: 'Space Name or ID',
				name: 'spaceId',
				type: 'options',
				required: true,
				default: '',
				description: 'The Google Chat space to send the message to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				typeOptions: {
					loadOptionsMethod: 'getSpaces',
				},
				displayOptions: {
					show: {
						authMethod: ['oauth2'],
					},
				},
			},
			{
				displayName: 'Thread Key',
				name: 'threadKey',
				type: 'string',
				default: '',
				description: 'Optional thread key to group messages. Leave empty to create a new thread.',
				displayOptions: {
					show: {
						'@version': [1],
						authMethod: ['oauth2', 'webhook'],
					},
				},
			},
			// Build Mode Selection
			{
				displayName: 'Build Mode',
				name: 'buildMode',
				type: 'options',
				default: 'simple',
				description: 'How to create the card message',
				options: [
					{
						name: 'Simple Card',
						value: 'simple',
						description: 'Quick card with basic elements',
					},
					{
						name: 'JSON Input',
						value: 'json',
						description: 'Provide raw JSON (advanced)',
					},
				],
			},
			// Simple Mode Properties
			{
				displayName: 'Card Header',
				name: 'simpleHeader',
				type: 'collection',
				placeholder: 'Add Header',
				default: {},
				displayOptions: {
					show: {
						buildMode: ['simple'],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Card title text',
					},
					{
						displayName: 'Subtitle',
						name: 'subtitle',
						type: 'string',
						default: '',
						description: 'Card subtitle text',
					},
					{
						displayName: 'Image URL',
						name: 'imageUrl',
						type: 'string',
						default: '',
						description: 'HTTPS URL of the header image',
					},
					{
						displayName: 'Image Style',
						name: 'imageType',
						type: 'options',
						default: 'CIRCLE',
						options: [
							{
								name: 'Circle',
								value: 'CIRCLE',
							},
							{
								name: 'Square',
								value: 'SQUARE',
							},
						],
						description: 'How to display the header image',
					},
				],
			},
			{
				displayName: 'Text Content',
				name: 'simpleText',
				type: 'string',
				default: '',
				typeOptions: {
					rows: 4,
				},
				description: 'Main text content of the card',
				displayOptions: {
					show: {
						buildMode: ['simple'],
					},
				},
			},
			{
				displayName: 'Text Format',
				name: 'simpleTextFormat',
				type: 'options',
				default: 'text',
				options: [
					{
						name: 'Plain Text',
						value: 'text',
					},
					{
						name: 'Markdown (Limited)',
						value: 'markdown',
					},
				],
				description: 'Text formatting. Note: Google Chat supports limited markdown.',
				displayOptions: {
					show: {
						buildMode: ['simple'],
					},
				},
			},
			{
				displayName: 'Buttons',
				name: 'simpleButtons',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: {},
				displayOptions: {
					show: {
						buildMode: ['simple'],
					},
				},
				placeholder: 'Add Button',
				options: [
					{
						name: 'button',
						displayName: 'Button',
						values: [
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								description: 'Button label text',
								required: true,
							},
							{
								displayName: 'Action Type',
								name: 'actionType',
								type: 'options',
								default: 'openLink',
								options: [
									{
										name: 'Open URL',
										value: 'openLink',
									},
									{
										name: 'Custom Action',
										value: 'action',
									},
								],
							},
							{
								displayName: 'URL',
								name: 'url',
								type: 'string',
								default: '',
								description: 'URL to open when button is clicked',
								displayOptions: {
									show: {
										actionType: ['openLink'],
									},
								},
								required: true,
							},
							{
								displayName: 'Action Method',
								name: 'actionMethod',
								type: 'string',
								default: '',
								description: 'Custom action method name',
								displayOptions: {
									show: {
										actionType: ['action'],
									},
								},
							},
							{
								displayName: 'Action Parameters',
								name: 'actionParameters',
								type: 'json',
								default: '{}',
								description: 'Custom action parameters as JSON',
								displayOptions: {
									show: {
										actionType: ['action'],
									},
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Additional Widgets',
				name: 'simpleWidgets',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				default: {},
				displayOptions: {
					show: {
						buildMode: ['simple'],
					},
				},
				placeholder: 'Add Widget',
				options: [
					{
						name: 'divider',
						displayName: 'Divider',
						values: [
							{
								displayName: 'Add Divider',
								name: 'enabled',
								type: 'boolean',
								default: true,
								description: 'Add a visual divider between sections',
							},
						],
					},
					{
						name: 'image',
						displayName: 'Image',
						values: [
							{
								displayName: 'Image URL',
								name: 'imageUrl',
								type: 'string',
								default: '',
								description: 'HTTPS URL of the image',
								required: true,
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
								type: 'options',
								default: 'nothing',
								options: [
									{
										name: 'Nothing',
										value: 'nothing',
									},
									{
										name: 'Open URL',
										value: 'openLink',
									},
								],
							},
							{
								displayName: 'Click URL',
								name: 'clickUrl',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										onClick: ['openLink'],
									},
								},
							},
						],
					},
					{
						name: 'decoratedText',
						displayName: 'Decorated Text',
						values: [
							{
								displayName: 'Text',
								name: 'text',
								type: 'string',
								default: '',
								description: 'Primary text content',
								required: true,
							},
							{
								displayName: 'Top Label',
								name: 'topLabel',
								type: 'string',
								default: '',
								description: 'Small text above the main text',
							},
							{
								displayName: 'Bottom Label',
								name: 'bottomLabel',
								type: 'string',
								default: '',
								description: 'Small text below the main text',
							},
							{
								displayName: 'Icon',
								name: 'icon',
								type: 'options',
								default: 'NONE',
								options: [
									{ name: 'None', value: 'NONE' },
									{ name: 'Airplane', value: 'AIRPLANE' },
									{ name: 'Bookmark', value: 'BOOKMARK' },
									{ name: 'Bus', value: 'BUS' },
									{ name: 'Car', value: 'CAR' },
									{ name: 'Clock', value: 'CLOCK' },
									{ name: 'Dollar', value: 'DOLLAR' },
									{ name: 'Email', value: 'EMAIL' },
									{ name: 'Event Seat', value: 'EVENT_SEAT' },
									{ name: 'Hotel', value: 'HOTEL' },
									{ name: 'Invite', value: 'INVITE' },
									{ name: 'Map Pin', value: 'MAP_PIN' },
									{ name: 'Membership', value: 'MEMBERSHIP' },
									{ name: 'Multiple People', value: 'MULTIPLE_PEOPLE' },
									{ name: 'Person', value: 'PERSON' },
									{ name: 'Phone', value: 'PHONE' },
									{ name: 'Restaurant', value: 'RESTAURANT' },
									{ name: 'Shopping Cart', value: 'SHOPPING_CART' },
									{ name: 'Star', value: 'STAR' },
									{ name: 'Store', value: 'STORE' },
									{ name: 'Ticket', value: 'TICKET' },
									{ name: 'Train', value: 'TRAIN' },
									{ name: 'Video Camera', value: 'VIDEO_CAMERA' },
									{ name: 'Video Play', value: 'VIDEO_PLAY' },
								],
							},
						],
					},
					{
						name: 'grid',
						displayName: 'Grid',
						values: [
							{
								displayName: 'Grid Title',
								name: 'title',
								type: 'string',
								default: '',
								description: 'Optional title for the grid',
							},
							{
								displayName: 'Rows',
								name: 'rows',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
									sortable: true,
								},
								default: {},
								placeholder: 'Add Row',
								options: [
									{
										name: 'row',
										displayName: 'Row',
										values: [
											{
												displayName: 'Cells',
												name: 'cells',
												type: 'string',
												default: '',
												description: 'Comma-separated cell values (e.g., "Name, Value, Status")',
												required: true,
											},
										],
									},
								],
							},
							{
								displayName: 'Column Count',
								name: 'columnCount',
								type: 'number',
								default: 2,
								description: 'Number of columns in the grid',
								typeOptions: {
									minValue: 1,
									maxValue: 3,
								},
							},
						],
					},
					{
						name: 'textInput',
						displayName: 'Text Input',
						values: [
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								description: 'Label for the input field',
								required: true,
							},
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Unique name for this input field',
								required: true,
							},
							{
								displayName: 'Hint Text',
								name: 'hintText',
								type: 'string',
								default: '',
								description: 'Placeholder or hint text',
							},
							{
								displayName: 'Default Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Initial value for the input',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								default: 'SINGLE_LINE',
								options: [
									{ name: 'Single Line', value: 'SINGLE_LINE' },
									{ name: 'Multiple Lines', value: 'MULTIPLE_LINE' },
								],
							},
						],
					},
					{
						name: 'selectionInput',
						displayName: 'Selection Input',
						values: [
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								description: 'Label for the selection',
								required: true,
							},
							{
								displayName: 'Field Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Unique name for this selection field',
								required: true,
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								default: 'DROPDOWN',
								options: [
									{ name: 'Dropdown', value: 'DROPDOWN' },
									{ name: 'Radio Buttons', value: 'RADIO_BUTTON' },
									{ name: 'Checkboxes', value: 'CHECK_BOX' },
									{ name: 'Switch', value: 'SWITCH' },
									{ name: 'Multi-Select', value: 'MULTI_SELECT' },
								],
							},
							{
								displayName: 'Options',
								name: 'items',
								type: 'fixedCollection',
								typeOptions: {
									multipleValues: true,
									sortable: true,
								},
								default: {},
								placeholder: 'Add Option',
								options: [
									{
										name: 'item',
										displayName: 'Option',
										values: [
											{
												displayName: 'Text',
												name: 'text',
												type: 'string',
												default: '',
												description: 'Display text for this option',
												required: true,
											},
											{
												displayName: 'Value',
												name: 'value',
												type: 'string',
												default: '',
												description: 'Value when this option is selected',
												required: true,
											},
											{
												displayName: 'Selected',
												name: 'selected',
												type: 'boolean',
												default: false,
												description: 'Whether this option is selected by default',
											},
										],
									},
								],
							},
						],
					},
				],
			},
			// JSON Mode Properties
			{
				displayName: 'Card JSON',
				name: 'cardJson',
				type: 'json',
				default: '{\n  "cardsV2": [\n    {\n      "card": {\n        "header": {\n          "title": "Card Title",\n          "subtitle": "Card Subtitle"\n        },\n        "sections": [\n          {\n            "widgets": [\n              {\n                "textParagraph": {\n                  "text": "Your message here"\n                }\n              }\n            ]\n          }\n        ]\n      }\n    }\n  ]\n}',
				description: 'Complete card JSON following Google Chat Cards v2 format',
				displayOptions: {
					show: {
						buildMode: ['json'],
					},
				},
				typeOptions: {
					alwaysOpenEditWindow: true,
					rows: 15,
				},
			},
			{
				displayName: 'See <a href="https://developers.google.com/workspace/chat/api/reference/rest/v1/cards" target="_blank">Google Chat Cards v2 Documentation</a> for JSON structure',
				name: 'jsonNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						buildMode: ['json'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			async getSpaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				try {
					const requestOptions: IHttpRequestOptions = {
						method: 'GET' as IHttpRequestMethods,
						url: 'https://chat.googleapis.com/v1/spaces',
						qs: {
							pageSize: 100,
						},
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'googleChatOAuth2Api',
						requestOptions,
					);

					if (response.spaces && Array.isArray(response.spaces)) {
						for (const space of response.spaces) {
							if (space.type === 'SPACE' || space.type === 'GROUP_CHAT') {
								returnData.push({
									name: space.displayName || space.name,
									value: space.name,
								});
							}
						}
					}
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject);
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const authMethod = this.getNodeParameter('authMethod', i, 'webhook') as string;
				const threadKey = this.getNodeParameter('threadKey', i, '') as string;
				const buildMode = this.getNodeParameter('buildMode', i) as string;

				let messageBody: any;

				if (buildMode === 'simple') {
					messageBody = buildSimpleCard.call(this, i);
				} else if (buildMode === 'json') {
					const cardJson = this.getNodeParameter('cardJson', i) as string;
					try {
						messageBody = JSON.parse(cardJson);
					} catch (error) {
						throw new Error(`Invalid JSON: ${(error as Error).message}`);
					}
				}

				let response: any;

				if (authMethod === 'webhook') {
					// Webhook authentication - simpler approach
					const webhookUrl = this.getNodeParameter('webhookUrl', i) as string;

					// Validate webhook URL
					if (!webhookUrl.includes('chat.googleapis.com')) {
						throw new Error('Invalid webhook URL. Please use a valid Google Chat webhook URL.');
					}

					// Add thread key to body if provided
					if (threadKey) {
						messageBody.thread = { threadKey };
					}

					// Send via webhook
					const requestOptions: IHttpRequestOptions = {
						method: 'POST' as IHttpRequestMethods,
						url: webhookUrl,
						body: messageBody,
						headers: {
							'Content-Type': 'application/json',
						},
					};

					response = await this.helpers.httpRequest.call(this, requestOptions);
				} else {
					// OAuth2 authentication - original approach
					const spaceId = this.getNodeParameter('spaceId', i) as string;

					const requestOptions: IHttpRequestOptions = {
						method: 'POST' as IHttpRequestMethods,
						url: `https://chat.googleapis.com/v1/${spaceId}/messages`,
						body: messageBody,
						qs: {} as any,
					};

					// Add thread key if provided
					if (threadKey) {
						requestOptions.qs!.threadKey = threadKey;
					}

					// Send the message
					response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'googleChatOAuth2Api',
						requestOptions,
					);
				}

				returnData.push({
					json: response,
					pairedItem: i,
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

function buildSimpleCard(this: IExecuteFunctions, itemIndex: number): any {
		const header = this.getNodeParameter('simpleHeader', itemIndex, {}) as any;
		const text = this.getNodeParameter('simpleText', itemIndex, '') as string;
		const buttons = this.getNodeParameter('simpleButtons', itemIndex, {}) as any;
		const widgets = this.getNodeParameter('simpleWidgets', itemIndex, {}) as any;

		const card: any = {
			cardsV2: [
				{
					card: {
						sections: [],
					},
				},
			],
		};

		// Add header if provided
		if (header.title || header.subtitle || header.imageUrl) {
			card.cardsV2[0].card.header = {};
			if (header.title) card.cardsV2[0].card.header.title = header.title;
			if (header.subtitle) card.cardsV2[0].card.header.subtitle = header.subtitle;
			if (header.imageUrl) {
				card.cardsV2[0].card.header.imageUrl = header.imageUrl;
				card.cardsV2[0].card.header.imageType = header.imageType || 'CIRCLE';
			}
		}

		const section: any = { widgets: [] };

		// Add main text if provided
		if (text) {
			const textWidget: any = {
				textParagraph: {
					text: text,
				},
			};
			section.widgets.push(textWidget);
		}

		// Add additional widgets
		if (widgets.divider && Array.isArray(widgets.divider)) {
			for (const divider of widgets.divider) {
				if (divider.enabled) {
					section.widgets.push({ divider: {} });
				}
			}
		}

		if (widgets.image && Array.isArray(widgets.image)) {
			for (const img of widgets.image) {
				const imageWidget: any = {
					image: {
						imageUrl: img.imageUrl,
					},
				};
				if (img.altText) {
					imageWidget.image.altText = img.altText;
				}
				if (img.onClick === 'openLink' && img.clickUrl) {
					imageWidget.image.onClick = {
						openLink: {
							url: img.clickUrl,
						},
					};
				}
				section.widgets.push(imageWidget);
			}
		}

		if (widgets.decoratedText && Array.isArray(widgets.decoratedText)) {
			for (const decorated of widgets.decoratedText) {
				const decoratedWidget: any = {
					decoratedText: {
						text: decorated.text,
					},
				};
				if (decorated.topLabel) {
					decoratedWidget.decoratedText.topLabel = decorated.topLabel;
				}
				if (decorated.bottomLabel) {
					decoratedWidget.decoratedText.bottomLabel = decorated.bottomLabel;
				}
				if (decorated.icon && decorated.icon !== 'NONE') {
					decoratedWidget.decoratedText.startIcon = {
						knownIcon: decorated.icon,
					};
				}
				section.widgets.push(decoratedWidget);
			}
		}

		// Add Grid widget
		if (widgets.grid && Array.isArray(widgets.grid)) {
			for (const grid of widgets.grid) {
				const gridWidget: any = {
					grid: {
						columnCount: grid.columnCount || 2,
						items: [],
					},
				};

				if (grid.title) {
					gridWidget.grid.title = grid.title;
				}

				if (grid.rows && grid.rows.row) {
					for (const row of grid.rows.row) {
						const cells = row.cells.split(',').map((cell: string) => cell.trim());
						for (const cellText of cells) {
							gridWidget.grid.items.push({
								textParagraph: {
									text: cellText,
								},
							});
						}
					}
				}

				section.widgets.push(gridWidget);
			}
		}

		// Add TextInput widget
		if (widgets.textInput && Array.isArray(widgets.textInput)) {
			for (const input of widgets.textInput) {
				const textInputWidget: any = {
					textInput: {
						label: input.label,
						name: input.name,
						type: input.type || 'SINGLE_LINE',
					},
				};

				if (input.hintText) {
					textInputWidget.textInput.hintText = input.hintText;
				}

				if (input.value) {
					textInputWidget.textInput.initialValue = input.value;
				}

				section.widgets.push(textInputWidget);
			}
		}

		// Add SelectionInput widget
		if (widgets.selectionInput && Array.isArray(widgets.selectionInput)) {
			for (const selection of widgets.selectionInput) {
				const selectionWidget: any = {
					selectionInput: {
						label: selection.label,
						name: selection.name,
						type: selection.type || 'DROPDOWN',
						items: [],
					},
				};

				if (selection.items && selection.items.item) {
					for (const item of selection.items.item) {
						const selectionItem: any = {
							text: item.text,
							value: item.value,
						};
						if (item.selected) {
							selectionItem.selected = true;
						}
						selectionWidget.selectionInput.items.push(selectionItem);
					}
				}

				section.widgets.push(selectionWidget);
			}
		}

		// Add buttons
		if (buttons.button && Array.isArray(buttons.button) && buttons.button.length > 0) {
			const buttonList: any = {
				buttonList: {
					buttons: [],
				},
			};

			for (const btn of buttons.button) {
				const button: any = {
					text: btn.text,
				};

				if (btn.actionType === 'openLink' && btn.url) {
					button.onClick = {
						openLink: {
							url: btn.url,
						},
					};
				} else if (btn.actionType === 'action') {
					button.onClick = {
						action: {
							function: btn.actionMethod || 'defaultAction',
						},
					};
					if (btn.actionParameters) {
						try {
							const params = JSON.parse(btn.actionParameters);
							button.onClick.action.parameters = params;
						} catch (e) {
							// If parsing fails, use as-is
							button.onClick.action.parameters = btn.actionParameters;
						}
					}
				}

				buttonList.buttonList.buttons.push(button);
			}

			section.widgets.push(buttonList);
		}

		// Only add section if it has widgets
		if (section.widgets.length > 0) {
			card.cardsV2[0].card.sections.push(section);
		}

		return card;
}