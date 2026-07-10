export class JavelParser {
    constructor(options = {}) {
        this._ = {};
        this._.options = Object.assign({
            blank: true,
            plugins: { fences: {} }
        }, options);
        this._.inlineParser = new InlineParser(this._.options);
        this._.tokenizers = [
            new BlankTokenizer(this._.options),
            new FenceTokenizer(this._.options),
            new BlockTokenizer(this._.options)
        ];
        this._.lexers = {
            'Blank': new BlankLexer(this._.options),
            'Fence': new FenceLexer(this._.options, this._.inlineParser),
            'Block': new BlockLexer(this._.options, this._.inlineParser),
        };
//        this._.blankLexer = new BlankLexer(this._.options);
//        this._.fenceLexer = new FenceLexer(this._.options, this._.inlineParser);
//        this._.blockLexer = new BlockLexer(this._.options, this._.inlineParser);
    }
    *parse(manuscript) {
        // 改行コードを一括統一（位置がズレないため、かつフェンス内も含めて統一してOKな処理）
        const normalized = this.#normalize(manuscript)
        let pos = 0;
        const length = normalized.length;
        while (pos < length) {
            let matched = false;
            for (const tokenizer of this._.tokenizers) {
                const token = tokenizer.tryTokenize(normalized, pos);
                if (token) {
                    pos = token.end;
//                    const node = this._.lexTopLevel(token);
                    const node = this._.lexers[token.type]?.lex(token);
                    if (node) yield node;
                    matched = true;
                    break;
                }
            }
            if (!matched) {throw new Error(`パース失敗。実装を見直してください。(pos: ${pos})`);}
        }
    }
    #normalize(manuscript) {return manuscript.replace(/\r\n/g, '\n').replace(/\r/g, '\n');}
    /*
    lexTopLevel(token) {
        switch (token.type) {
            case 'Blank': return this._.blankLexer.lex(token);
            case 'Fence': return this._.fenceLexer.lex(token);
            case 'Block': return this._.blockLexer.lex(token);
            default: return null;
        }
    }
    */
}
