#!/bin/sh

INPUT="data/raw/allArticles.txt"
OUTPUT_DIR="data/glove"
echo $(pwd)
cat $INPUT | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:] $\n' | GloVe/build/vocab_count -verbose 2 -max-vocab 100000 -min-count 10 > ${OUTPUT_DIR}/vocab.txt
