data/raw:
	mkdir -p data/raw
	while read -r file; do \
		cd data/raw; wget "$$file"; \
	done <data/rawlinks

realclean:
	rm -fr data/raw
