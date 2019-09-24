package edu.berkeley.w210.nyt;


import com.nytlabs.corpus.NYTCorpusDocument;
import com.nytlabs.corpus.NYTCorpusDocumentParser;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

public class NYTCorpusGloveTransformer {

    public NYTCorpusGloveTransformer() {

    }

    public NYTCorpusDocument getFirstDocument(ZipFile corpus) throws IOException, ParserConfigurationException, SAXException {
        NYTCorpusDocumentParser parser = new NYTCorpusDocumentParser();
        Stream<? extends ZipEntry> stream = corpus.stream().filter(o -> !((ZipEntry) o).isDirectory());
        Optional<ZipEntry> entryOptional = (Optional<ZipEntry>) stream.findFirst();
        if (entryOptional.isPresent()) {
            ZipEntry entry = entryOptional.get();
            System.out.println(entry);
            Document d = getDOMObject(corpus, entry, false);
            return parser.parseNYTCorpusDocumentFromDOMDocument(null, d);
        }

        return null;
    }

    private Document getDOMObject(ZipFile zipFile, ZipEntry zipEntry, boolean validating)
            throws SAXException, IOException, ParserConfigurationException {

        // Create a builder factory

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        if (!validating) {
            factory.setValidating(validating);
            factory.setSchema(null);
            factory.setNamespaceAware(false);
        }

        DocumentBuilder builder = factory.newDocumentBuilder();
        // Create the builder and parse the file
        Document doc = builder.parse(zipFile.getInputStream(zipEntry));
        return doc;
    }

}
