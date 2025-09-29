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
				required: true,
			},
		],
		properties: [
			// Space/Thread Selection
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
				const spaceId = this.getNodeParameter('spaceId', i) as string;
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

				// Prepare the request
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
				const response = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'googleChatOAuth2Api',
					requestOptions,
				);

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