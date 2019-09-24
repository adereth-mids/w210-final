package edu.berkeley.w210.nyt;

import edu.jhu.hlt.concrete.Communication;
import edu.jhu.hlt.concrete.serialization.CompactCommunicationSerializer;
import edu.jhu.hlt.concrete.serialization.TarGzCompactCommunicationSerializer;
import edu.jhu.hlt.concrete.util.ConcreteException;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.compressors.gzip.GzipUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.zip.GZIPInputStream;

public class NYTCorpusConcreteReader {

    public NYTCorpusConcreteReader() {
    }

    public static Communication readFirst(File monthFile) throws IOException, ConcreteException {
        FileInputStream inputStream = new FileInputStream(monthFile);
        GZIPInputStream gzipInputStream = new GZIPInputStream(inputStream);
        TarArchiveInputStream tarArchiveInputStream = new TarArchiveInputStream(gzipInputStream);
        TarArchiveEntry entry;
        Communication result = null;
        while ((entry = tarArchiveInputStream.getNextTarEntry()) != null) {
            if (entry.isFile()) {
                System.out.println(entry.getName());
                byte[] bytes = new byte[(int) entry.getSize()];
                //tarArchiveInputStream.read(bytes);
                //tarArchiveInputStream.getRecordSize();
                //System.out.println("Read bytes");
                //System.out.println(new String(bytes));
                //System.out.println("Printed bytes");
                CompactCommunicationSerializer ser = new CompactCommunicationSerializer();
                result = ser.fromInputStream(tarArchiveInputStream);
                break;
            }
        }
        tarArchiveInputStream.close();
        return result;
    }

    public static void main(String[] args) {

        try {
            Communication communication = NYTCorpusConcreteReader.readFirst(new File("D:\\Downloads\\198701.tar.gz"));
            //CompactCommunicationSerializer ser = new CompactCommunicationSerializer();
            //Communication communication = ser.fromPathString("D:\\Downloads\\198701\\AnnotatedNYT-3697.comm");
            System.out.println(communication);
        } catch (ConcreteException | IOException e) {
            e.printStackTrace();
        }

    }
}
