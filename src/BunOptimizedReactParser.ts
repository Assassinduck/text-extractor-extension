export interface ComponentInfo {
    name: string;
    type: 'arrow' | 'function' | 'class';
    isExported: boolean;
    line: number;
    isLikelyReactComponent: boolean;
}

export class BunOptimizedReactParser {
    private static readonly COMPONENT_PATTERNS = {
        // Fixed: More flexible arrow function pattern that handles multiline declarations
        arrow: /^(export\s+)?(?:const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*=\s*(?:\([^)]*\)|\w+)\s*=>\s*\{?/gm,
        function: /^(export\s+)?function\s+([A-Z][a-zA-Z0-9]*)\s*\(/gm,
        class: /^(export\s+)?class\s+([A-Z][a-zA-Z0-9]*)\s+extends\s+.*Component/gm
    };

    constructor(private sourceCode: string) { }

    findComponents(): ComponentInfo[] {
        const components: ComponentInfo[] = [];

        // Reset regex lastIndex for reuse
        Object.values(BunOptimizedReactParser.COMPONENT_PATTERNS).forEach(regex => {
            regex.lastIndex = 0;
        });

        // Find arrow functions
        this.findPattern('arrow', components);
        this.findPattern('function', components);
        this.findPattern('class', components);

        return components.sort((a, b) => a.line - b.line);
    }

    private findPattern(type: keyof typeof BunOptimizedReactParser.COMPONENT_PATTERNS, components: ComponentInfo[]): void {
        const pattern = BunOptimizedReactParser.COMPONENT_PATTERNS[type];
        let match: RegExpExecArray | null;

        match = pattern.exec(this.sourceCode);
        while (match !== null) {
            const line = this.getLineNumber(match.index);
            const isExported = !!match[1];
            const name = match[2] ?? '';

            components.push({
                name,
                type: type as 'arrow' | 'function' | 'class',
                isExported,
                line,
                isLikelyReactComponent: this.fastReactCheck(name)
            });

            match = pattern.exec(this.sourceCode);
        }
    }

    private getLineNumber(index: number): number {
        return this.sourceCode.substring(0, index).split('\n').length;
    }

    private fastReactCheck(componentName: string): boolean {
        // Improved: Better multiline matching with dotall flag
        const componentRegex = new RegExp(
            `${componentName}[\\s\\S]*?(?:<[A-Z][a-zA-Z]*|use[A-Z][a-zA-Z]*|return\\s*\\(|return\\s*<)`,
            'i'
        );
        return componentRegex.test(this.sourceCode);
    }
}