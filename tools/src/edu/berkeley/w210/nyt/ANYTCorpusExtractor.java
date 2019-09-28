package edu.berkeley.w210.nyt;

import com.google.common.collect.Iterators;
import edu.jhu.hlt.concrete.Communication;

import java.io.*;
import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

public class ANYTCorpusExtractor {

    private final File _archiveDirectory;
    private final File[] _files;

    public ANYTCorpusExtractor(File archiveDirectory) {
        _archiveDirectory = archiveDirectory;
        _files = _archiveDirectory.listFiles();
        Arrays.sort(_files);

    }


    public void countArticles() {
        final AtomicInteger i = new AtomicInteger(0);
        for (File f : _files) {
            System.out.println("Processing " + f);
            CommunicationIterableFromTarGz communications = new CommunicationIterableFromTarGz(f);
            Stream<Communication> communicationStream = StreamSupport.stream(communications.spliterator(), false);
            communicationStream.forEach(communication -> {
                i.incrementAndGet();
                if (i.get() % 1000 == 0) { System.out.println(i.get());}
            });
        }
        System.out.println(i.get());

    }

    public void writeTextPerLine(File destination) throws IOException {

        FileWriter writer = new FileWriter(destination);
        for (File f : _files) {
            long start = System.currentTimeMillis();
            System.out.println("Processing " + f);
            CommunicationIterableFromTarGz communications = new CommunicationIterableFromTarGz(f);
            Stream<Communication> communicationStream = StreamSupport.stream(communications.spliterator(), false);
            communicationStream.forEach(communication -> {
                String singleLineVersion = communication.getText().replace("\n", " ");
                try {
                    writer.write(singleLineVersion);
                    writer.write("\n");
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
            System.out.println("Took " + ((System.currentTimeMillis() - start) / 1000) + "s");
        }

    }

    public static void main(String[] args) {
        ANYTCorpusExtractor extractor = new ANYTCorpusExtractor(new File("/home/madereth/Projects/w210-final/data/raw/anyt"));
        long start = System.currentTimeMillis();
        try {
            extractor.writeTextPerLine(new File("/home/madereth/allArticles.txt"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        System.out.println(System.currentTimeMillis() - start);
    }
}
