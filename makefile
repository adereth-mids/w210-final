data/raw:
	mkdir -p data/raw
	while read -r file; do \
		cd data/raw; wget "$$file"; \
	done <data/rawlinks

realclean:
	rm -fr data/raw

data/glove/vocab.txt:
	cat data/raw/allArticles.txt | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:] $\n' | GloVe/build/vocab_count -verbose 2 -max-vocab 100000 -min-count 10 > data/glove/vocab.txt

data/glove/cooccurrences.bin: data/glove/vocab.txt
	cat data/raw/allArticles.txt | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:] $\n' | GloVe/build/cooccur -verbose 2 -symmetric 0 -window-size 10 -vocab-file data/glove/vocab.txt -memory 8.0 -overflow-file tempoverflow > data/glove/cooccurrences.bin

data/glove/cooccurrences.shuf.bin: data/glove/cooccurrences.bin
	GloVe/build/shuffle -verbose 2 -memory 8.0 < data/glove/cooccurrences.bin > data/glove/cooccurrences.shuf.bin

data/glove/vectors: data/glove/cooccurrences.shuf.bin data/glove/vocab.txt
	GloVe/build/glove -save-file data/glove/vectors -threads 8 -input-file data/glove/cooccurrences.shuf.bin -vector-size 200 -binary 2 -vocab-file data/glove/vocab.txt

GloVe:
	git clone https://github.com/stanfordnlp/GloVe
	cd GloVe; make
